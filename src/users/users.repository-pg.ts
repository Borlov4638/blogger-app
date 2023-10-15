import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../entyties/users.chema';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

interface IUsersPaganationQuery {
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
    searchLoginTerm: string;
    searchEmailTerm: string;
}

export class UsersRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cryptoService: CryptoService,
    ) { }

    private usersSortingQuery(sortBy: string): {} {
        switch (sortBy) {
            case 'id':
                return 'id';
            case 'login':
                return 'login';
            case 'email':
                return 'email';
            case 'createdAt':
                return 'createdAt';
            default:
                return 'createdAt';
        }
    }


    async getAllUsers(paganation: IUsersPaganationQuery) {
        const searchLoginTerm = paganation.searchLoginTerm
            ? paganation.searchLoginTerm
            : '';

        const searchEmailTerm = paganation.searchEmailTerm
            ? paganation.searchEmailTerm
            : '';

        const sortBy = paganation.sortBy ? paganation.sortBy : 'createdAt';

        const sortDirection = paganation.sortDirection === 'asc' ? 'asc' : 'desc';

        const sotringQuery = this.usersSortingQuery(sortBy);

        const pageNumber = paganation.pageNumber ? +paganation.pageNumber : 1;

        const pageSize = paganation.pageSize ? +paganation.pageSize : 10;

        const itemsToSkip = (pageNumber - 1) * pageSize;

        const usersToSend = await this.dataSource.query(`
            SELECT "login", "email", "createdAt", "id" FROM users
            where lower ("login") LIKE lower ('%${searchLoginTerm}%') and lower ("email") LIKE lower ('%${searchEmailTerm}%')
            order by "${sotringQuery}" ${sortDirection}
            limit ${pageSize}
            offset ${itemsToSkip}
        `)
        usersToSend.map(u => {
            u.id = u.id.toString()
            return u

        })

        const totalCountOfItems = (await this.dataSource.query(`
            SELECT * FROM users
            where lower ("login") LIKE lower ('%${searchLoginTerm}%') and lower ("email") LIKE lower ('%${searchEmailTerm}%')
        `)).length

        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountOfItems,
            items: [...usersToSend],
        };

        return mappedResponse
    }

    async createUser(
        login: string,
        email: string,
        password: string,
        isConfirmed: boolean,
    ) {
        const date = +(new Date()) + 180000
        let user
        await this.dataSource.query(`INSERT INTO users ("login", "email", "password", "isConfirmed", "expirationDate") VALUES ('${login}', '${email}', '${password}', '${isConfirmed}', '${date}');`)
        if (isConfirmed) {
            const user = (await this.dataSource.query(`SELECT "login", "email", "id", "createdAt" From users where "login" = '${login}' and "email" = '${email}'`))[0]
            user.id = user.id.toString()
            return user
        } else {
            user = (await this.dataSource.query(`SELECT * From users where "login" = '${login}' and "email" = '${email}'`))[0]
            const userToReturn = {
                login: user.login,
                email: user.email,
                password: user.password,
                emailConfirmation: {
                    isConfirmed: false,
                    expirationDate: user.expirationDate,
                    confirmationCode: user.confirmationCode
                }
            }
            return userToReturn
        }
    }

    async deleteUserById(id: string) {
        const deletedUser = await this.dataSource.query(`DELETE FROM users WHERE "id" = '${id}'`)
        return deletedUser[1]
    }

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
        const user = (await this.dataSource.query(`SELECT * FROM users WHERE "login" = '${loginOrEmail}' or "email" = '${loginOrEmail}'`))[0]
        let userToReturn = user
        if (user) {
            userToReturn = {
                id: user.id.toString(),
                login: user.login,
                email: user.email,
                password: user.password,
                emailConfirmation: {
                    isConfirmed: user.isConfirmed,
                    expirationDate: user.expirationDate,
                    confirmationCode: user.confirmationCode
                }
            }
        }


        // return await this.userModel.findOne({
        //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
        // });
        return userToReturn as UserDocument
    }

    async confirmUserByCode(code: string) {
        const user = (await this.dataSource.query(`SELECT * from users WHERE "confirmationCode" = '${code}'`))[0]
        // const user = await this.userModel.findOne({
        //     'emailConfirmation.confirmationCode': code,
        // });
        if (!user) {
            throw new BadRequestException('invalid code');
        }

        if (user.expirationDate < +new Date()) {
            throw new BadRequestException('invalid code');
        }
        if (user.isConfirmed === true) {
            throw new BadRequestException('invalid code');
        }
        await this.dataSource.query(`UPDATE users SET "isConfirmed" = true WHERE "confirmationCode" = '${code}'`)
        // await user.confirm();
        // await user.save();
        // console.log(user);
        // return;
        return
    }

    async changePassword(newPassword: string, user: UserDocument) {
        const password = await this.cryptoService.getHash(newPassword, 10);
        this.dataSource.query(`UPDATE users SET "password" = '${password}' WHERE "id" = '${user.id}'`)
        return;
    }

    async newConfirmationCode(id: string) {
        const newCode = uuidv4()
        await this.dataSource.query(`UPDATE users SET "confirmationCode" = '${newCode}', "expirationDate" = '${+(new Date()) + 180000}' WHERE "id" = '${parseInt(id)}'`)
        return newCode
    }
}
