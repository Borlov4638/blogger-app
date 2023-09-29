import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CryptoService } from '../crypto/crypto.service';
import { User, UserDocument } from '../entyties/users.chema';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

interface ICreateUser {
  email: string;
  login: string;
  password: string;
}

interface IUsersPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
}


interface ILoginUser{
  loginOrEmail:string
  password:string
}
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cryptoService: CryptoService,
    private usersRepository: UsersRepository,
  ) {}

  async getAllUsers(paganation: IUsersPaganationQuery) {
    const searchLoginTerm = paganation.searchLoginTerm
      ? paganation.searchLoginTerm
      : '';

    const searchEmailTerm = paganation.searchEmailTerm
      ? paganation.searchEmailTerm
      : '';

    const sortBy = paganation.sortBy ? paganation.sortBy : 'createdAt';

    const sortDirection = paganation.sortDirection === 'asc' ? 1 : -1;

    const sotringQuery = this.usersRepository.usersSortingQuery(
      sortBy,
      sortDirection,
    );

    const pageNumber = paganation.pageNumber ? +paganation.pageNumber : 1;

    const pageSize = paganation.pageSize ? +paganation.pageSize : 10;

    const itemsToSkip = (pageNumber - 1) * pageSize;

    const usersToSend = await this.userModel
      .find(
        {
          $or: [
            { login: { $regex: searchLoginTerm, $options: 'i' } },
            { email: { $regex: searchEmailTerm, $options: 'i' } },
          ],
        },
        { _id: false, password: false, __v: false },
      )
      .sort(sotringQuery)
      .skip(itemsToSkip)
      .limit(pageSize);

    const totalCountOfItems = (
      await this.userModel.find({
        $or: [
          { login: { $regex: searchLoginTerm, $options: 'i' } },
          { email: { $regex: searchEmailTerm, $options: 'i' } },
        ],
      })
    ).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...usersToSend],
    };

    return mappedResponse;
  }

  async createUser(data: ICreateUser) {
    const hashedPassword = await this.cryptoService.getHash(data.password, 10);
    const newUser = new this.userModel({ ...data, password: hashedPassword });
    return await newUser.save().then((newUser) => {
      const plainUser: UserDocument = newUser.toObject();
      delete plainUser._id;
      delete plainUser.__v;
      delete plainUser.password;
      setTimeout(() => {}, 10);
      return plainUser;
    });
  }

  async deleteUserById(id: string) {
    const deletedUser = await this.userModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
    if (!deletedUser) {
      throw new NotFoundException();
    }
    return;
  }

  async getUserByLoginOrEmail(credentials:ILoginUser){
    return await this.userModel.findOne({$or:[{login:credentials.loginOrEmail}, {login:credentials.loginOrEmail}]})
  }
}
