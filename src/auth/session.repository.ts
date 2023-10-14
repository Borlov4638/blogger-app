import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from '../entyties/session.schema';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) { }

  async createSession(
    userId: string,
    deviceId: string,
    ip: string,
    title: string,
    lastActiveDate: number,
    expiration: string,
    refreshHash: string,
  ) {
    const newSession = new this.sessionModel({
      userId,
      deviceId,
      ip,
      title,
      lastActiveDate: new Date(lastActiveDate).toISOString(),
      expiration,
      refreshHash,
    });
    return await newSession.save();
  }

  async findSessionByRefreshHash(refreshHash: string) {
    return await this.sessionModel.findOne({ refreshHash });
  }
  async refreshCurrentSession(
    deviceId: string,
    ip: string,
    title: string,
    expiration: string,
    refreshHash: string,
    lastActiveDate: number,
  ) {
    const updatedSession = await this.sessionModel.findOneAndUpdate(
      { deviceId },
      {
        ip,
        title,
        lastActiveDate: new Date(lastActiveDate).toISOString(),
        expiration,
        refreshHash,
      },
    );
    return updatedSession;
  }
  async deleteSessionById(deviceId: string) {
    return await this.sessionModel.findOneAndDelete({ deviceId });
  }
  async getUserSessions(userId: string) {
    return await this.sessionModel.find(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        _id: false,
        __v: false,
        expiration: false,
        userId: false,
        refreshHash: false,
      },
    );
  }

  async deleteOtherSessions(userId: string, deviceId: string) {
    await this.sessionModel.deleteMany({
      userId: new Types.ObjectId(userId),
      deviceId: { $not: { $regex: deviceId } },
    });
    return;
  }

  async findSessionById(deviceId: string) {
    return await this.sessionModel.findOne({ deviceId });
  }
}
