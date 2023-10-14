import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../entyties/users.chema';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CryptoService } from 'src/crypto/crypto.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
            where "login" LIKE '%${searchLoginTerm}%' and "email" LIKE '%${searchEmailTerm}%'
            order by "${sotringQuery}" ${sortDirection}
            limit ${pageSize}
            offset ${itemsToSkip}
        `)

        const totalCountOfItems = (await this.dataSource.query(`
            SELECT * FROM users
            where "login" LIKE '%${searchLoginTerm}%' and "email" LIKE '%${searchEmailTerm}%'
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
        try {
            await this.dataSource.query(`INSERT INTO users ("login", "email", "password", "isConfirmed") VALUES ('${login}', '${email}', '${password}', '${isConfirmed}');`)
            return (await this.dataSource.query(`SELECT "login", "email", "password" From users where "login" = '${login}' and "email" = '${email}'`))[0]
            //TODO разобраться с массивом
        } catch {
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteUserById(id: string) {
        const deletedUser = await this.dataSource.query(`DELETE FROM users WHERE "id" = '${id}'`)
        return deletedUser[1]
    }

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
        return await this.dataSource.query(`SELECT * FROM users WHERE "login" = '${loginOrEmail}' or "email" = '${loginOrEmail}'`)
        // return await this.userModel.findOne({
        //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
        // });
        return
    }

    async confirmUserByCode(code: string) {
        // const user = await this.userModel.findOne({
        //     'emailConfirmation.confirmationCode': code,
        // });
        // if (!user) {
        //     throw new BadRequestException('invalid code');
        // }
        // if (user.emailConfirmation.expirationDate < +new Date()) {
        //     throw new BadRequestException('invalid code');
        // }
        // if (user.emailConfirmation.isConfirmed === true) {
        //     throw new BadRequestException('invalid code');
        // }
        // await user.confirm();
        // await user.save();
        // console.log(user);
        // return;
        return 1
    }

    async changePassword(newPassword: string, user: UserDocument) {
        // user.password = await this.cryptoService.getHash(newPassword, 10);
        // user.save();
        return;
    }
}
