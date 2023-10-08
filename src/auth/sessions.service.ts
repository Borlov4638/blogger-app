import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from '../entyties/users.chema';
import { v4 as uuidv4 } from 'uuid';
import { add, compareAsc, format } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../entyties/session.schema';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

interface IUsersRefreshToken {
  id: string;
  email: string;
  login: string;
  deviceId: string;
}

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private jwtService: JwtService,
  ) {}
  async createNewSession(req: Request, user: UserDocument, expDate: number) {
    const requestIp =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress!;

    const userAgent = req.headers['user-agent']
      ? req.headers['user-agent']
      : 'Chrome 105';

    const deviceId = uuidv4();

    const refreshTokenExpirationDate = add(new Date(), {
      seconds: expDate,
    }).toISOString();

    const lastActiveDate = Math.floor(+new Date() / 1000) * 1000;

    const newSession = new this.sessionModel({
      userId: user.id,
      deviceId,
      ip: requestIp,
      title: userAgent,
      lastActiveDate: new Date(lastActiveDate).toISOString(),
      expiration: refreshTokenExpirationDate,
    });
    await newSession.save();
    return newSession;
  }
  async updateCurrentSession(req: Request, expDate: number, deviceId: string) {
    const requestIp =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress!;

    const userAgent = req.headers['user-agent']
      ? req.headers['user-agent']
      : 'Chrome 105';

    const refreshTokenExpirationDate = add(new Date(), {
      seconds: expDate,
    }).toISOString();

    const lastActiveDate = Math.floor(+new Date() / 1000) * 1000;

    const updatedSession = await this.sessionModel.findOneAndUpdate(
      { deviceId },
      {
        ip: requestIp,
        title: userAgent,
        lastActiveDate: new Date(lastActiveDate).toISOString(),
        expiration: refreshTokenExpirationDate,
      },
    );
    return updatedSession;
  }
  async findSessionById(deviceId: string) {
    return await this.sessionModel.findOne({ deviceId });
  }
  async deleteSessionById(deviceId: string) {
    return await this.sessionModel.findOneAndDelete({ deviceId });
  }
  async deleteCurrentSession(request: Request) {
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.cookies.refreshToken,
    );
    await this.deleteSessionById(tokenData.deviceId);
    return;
  }
  async validateSession(request: Request) {
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.cookies.refreshToken,
    );
    const session = await this.findSessionById(tokenData.deviceId);
    if (!session) {
      throw new UnauthorizedException();
    }
    return session;
  }
  async getUserSessions(request: Request) {
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.headers.authorization.split(' ')[1],
    );
    return await this.sessionModel.find({
      userId: new Types.ObjectId(tokenData.id),
    });
  }
  async deleteOtherSessions(request: Request) {
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.cookies.refreshToken,
    );
    await this.sessionModel.deleteMany({
      userId: new Types.ObjectId(tokenData.id),
      deviceId: { $not: { $regex: tokenData.deviceId } },
    });
    return;
  }
}
