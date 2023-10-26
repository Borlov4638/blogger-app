import { UserDocument } from '../entyties/users.chema';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UsersEntity } from './entyties/users.entytie';

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
        @InjectRepository(UsersEntity) private readonly usersRepo: Repository<UsersEntity>,
        private cryptoService: CryptoService,
    ) { }

    private usersSortingQuery(sortBy: string) {
        switch (sortBy) {
            case 'id':
                return "id";
            case "login":
                return "login";
            case 'email':
                return "email";
            case 'createdAt':
                return "createdAt";
            default:
                return "createdAt";
        }
    }


    async getAllUsers(paganation: IUsersPaganationQuery) {
        console.log(paganation)
        const searchLoginTerm = paganation.searchLoginTerm
            ? paganation.searchLoginTerm
            : '';

        const searchEmailTerm = paganation.searchEmailTerm
            ? paganation.searchEmailTerm
            : '';

        const sortBy = paganation.sortBy ? paganation.sortBy : "createdAt";

        const sortDirection = paganation.sortDirection === 'asc' ? 'ASC' : 'DESC';

        const sotringQuery = this.usersSortingQuery(sortBy);

        const pageNumber = paganation.pageNumber ? +paganation.pageNumber : 1;

        const pageSize = paganation.pageSize ? +paganation.pageSize : 10;

        const itemsToSkip = (pageNumber - 1) * pageSize;

        console.log(searchEmailTerm, searchLoginTerm, sotringQuery, sortDirection, pageSize, itemsToSkip)

        const usersToSend = await this.usersRepo.createQueryBuilder('users')
            .where('LOWER(users.login) LIKE LOWER(:searchLoginTerm)', { searchLoginTerm: `%${searchLoginTerm}%` })
            .orWhere('LOWER(users.email) LIKE LOWER(:searchEmailTerm)', { searchEmailTerm: `%${searchEmailTerm}%` })
            .orderBy(`"${sortBy}"`, sortDirection)
            .limit(pageSize)
            .offset(itemsToSkip)
            .getMany()

        usersToSend.map(u => {
            u.id = u.id.toString()
            return u

        })

        const totalCountOfItems = await this.usersRepo.createQueryBuilder('users')
            .where(`LOWER (users.login) LIKE LOWER (:searchLoginTerm)`, { searchLoginTerm: `%${searchLoginTerm}%` })
            .orWhere(`LOWER (users.email) LIKE LOWER (:searchEmailTerm)`, { searchEmailTerm: `%${searchEmailTerm}%` })
            .getCount()

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
        let user = new UsersEntity()
        user.login = login
        user.email = email
        user.password = password
        user.isConfirmed = isConfirmed
        user.expirationDate = date
        await this.usersRepo.save(user)

        if (isConfirmed) {
            delete user.password
            delete user.isConfirmed
            delete user.expirationDate
            delete user.confirmationCode

            user.id = user.id.toString()
            return user
        } else {
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
        const deletedUser = await this.usersRepo.delete({ id })
        return deletedUser.affected
    }

    async getUserByLoginOrEmail(loginOrEmail: string) {
        const user = await this.usersRepo.createQueryBuilder('users')
            .where("users.login = :loginOrEmail", { loginOrEmail })
            .orWhere("users.email = :loginOrEmail", { loginOrEmail })
            .getOne()

        let userToReturn = null
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
        return userToReturn
    }

    async confirmUserByCode(code: string) {
        const user = await this.usersRepo.findOne({
            where: {
                confirmationCode: code
            }
        })
        if (!user) {
            throw new BadRequestException('invalid code');
        }

        if (user.expirationDate < +new Date()) {
            throw new BadRequestException('invalid code');
        }
        if (user.isConfirmed === true) {
            throw new BadRequestException('invalid code');
        }
        user.isConfirmed = true
        await this.usersRepo.save(user);
        return
    }

    async changePassword(newPassword: string, user: UserDocument) {
        const password = await this.cryptoService.getHash(newPassword, 10);
        await this.usersRepo.update({ id: user.id }, { password })
        return;
    }

    async newConfirmationCode(id: string) {
        const newCode = uuidv4()
        console.log(newCode)
        await this.usersRepo.update({ id: parseInt(id) }, { confirmationCode: newCode, expirationDate: +(new Date()) + 180000 })
        return newCode
    }
}
