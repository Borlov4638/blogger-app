import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../entyties/users.chema';
import { BadRequestException } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';

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
    @InjectModel(User.name) private userModel: Model<User>,
    private cryptoService: CryptoService,
  ) { }

  usersSortingQuery(sortBy: string, sortDirection: number): {} {
    switch (sortBy) {
      case 'id':
        return { id: sortDirection };
      case 'login':
        return { login: sortDirection };
      case 'email':
        return { email: sortDirection };
      case 'createdAt':
        return { createdAt: sortDirection };
      default:
        return { createdAt: 1 };
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

    const sortDirection = paganation.sortDirection === 'asc' ? 1 : -1;

    const sotringQuery = this.usersSortingQuery(sortBy, sortDirection);

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
        { _id: false, password: false, __v: false, emailConfirmation: false },
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

  async createUser(
    login: string,
    email: string,
    password: string,
    isConfirmed: boolean,
  ) {
    let newUser: UserDocument;
    let userToReturn;

    if (isConfirmed) {
      newUser = new this.userModel({ email, login, password });
      newUser.confirm();
      return (userToReturn = await newUser.save().then((newUser) => {
        const plainUser: UserDocument = newUser.toObject();
        delete plainUser._id;
        delete plainUser.__v;
        delete plainUser.password;
        delete plainUser.emailConfirmation;
        return plainUser;
      }));
    } else {
      newUser = new this.userModel({ email, login, password });
      return await newUser.save();
    }
  }

  async deleteUserById(id: string) {
    const deletedUser = await this.userModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
    return deletedUser;
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
    return await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async confirmUserByCode(code: string) {
    const user = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    if (!user) {
      throw new BadRequestException('invalid code');
    }
    if (user.emailConfirmation.expirationDate < +new Date()) {
      throw new BadRequestException('invalid code');
    }
    if (user.emailConfirmation.isConfirmed === true) {
      throw new BadRequestException('invalid code');
    }
    await user.confirm();
    await user.save();
    return;
  }

  async changePassword(newPassword: string, user: UserDocument) {
    user.password = await this.cryptoService.getHash(newPassword, 10);
    user.save();
    return;
  }
}
