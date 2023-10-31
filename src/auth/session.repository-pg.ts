import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionRepositoryPg {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createSession(
    userId: string,
    deviceId: string,
    ip: string,
    title: string,
    lastActiveDate: number,
    expiration: string,
    refreshHash: string,
  ) {
    await this.dataSource
      .query(`insert into sessions ("deviceId", "userId", "ip", "title", "expiration", "refreshHash", "lastActiveDate")
    values ('${deviceId}', '${userId}', '${ip}', '${title}', '${expiration}', '${refreshHash}', '${lastActiveDate}')
    `);
    return await this.dataSource.query(
      `select * from sessions where "deviceId" = '${deviceId}'`,
    );
    // const newSession = new this.sessionModel({
    //   userId,
    //   deviceId,
    //   ip,
    //   title,
    //   lastActiveDate: new Date(lastActiveDate).toISOString(),
    //   expiration,
    //   refreshHash,
    // });
    // return await newSession.save();
  }

  async findSessionByRefreshHash(refreshHash: string) {
    return (
      await this.dataSource.query(
        `select * from sessions where "refreshHash" = '${refreshHash}'`,
      )
    )[0];
  }

  async refreshCurrentSession(
    deviceId: string,
    ip: string,
    title: string,
    expiration: string,
    refreshHash: string,
    lastActiveDate: number,
  ) {
    await this.dataSource.query(`
    update sessions set
    "ip" = '${ip}', "title" = '${title}', "expiration" = '${expiration}', "refreshHash" = '${refreshHash}', "lastActiveDate" = '${lastActiveDate}' where "deviceId" = '${deviceId}';
    `);
    return (
      await this.dataSource.query(
        `select * from sessions where "deviceId" = '${deviceId}'`,
      )
    )[0];

    // const updatedSession = await this.sessionModel.findOneAndUpdate(
    //   { deviceId },
    //   {
    //     ip,
    //     title,
    //     lastActiveDate: new Date(lastActiveDate).toISOString(),
    //     expiration,
    //     refreshHash,
    //   },
    // );
    // return updatedSession;
  }
  async deleteSessionById(deviceId: string) {
    return (
      await this.dataSource.query(
        `DELETE FROM sessions WHERE "deviceId" = '${deviceId}'`,
      )
    )[1];
    // return await this.sessionModel.findOneAndDelete({ deviceId });
  }
  async getUserSessions(userId: string) {
    const sessions = await this.dataSource.query(
      `SELECT "ip", "title", "lastActiveDate", "deviceId" FROM sessions WHERE "userId" = '${userId}'`,
    );
    sessions.map((s) => {
      s.lastActiveDate = new Date(
        (s.lastActiveDate / 1000) * 1000,
      ).toISOString();
    });
    return sessions;
    // return await this.sessionModel.find(
    //   {
    //     userId: new Types.ObjectId(userId),
    //   },
    //   {
    //     _id: false,
    //     __v: false,
    //     expiration: false,
    //     userId: false,
    //     refreshHash: false,
    //   },
    // );
  }

  async deleteOtherSessions(userId: string, deviceId: string) {
    await this.dataSource.query(
      `delete from sessions where "userId" = '${userId}' and "deviceId" != '${deviceId}'`,
    );
    // await this.sessionModel.deleteMany({
    //   userId: new Types.ObjectId(userId),
    //   deviceId: { $not: { $regex: deviceId } },
    // });
    return;
  }

  async findSessionById(deviceId: string) {
    return (
      await this.dataSource.query(
        `SELECT * FROM sessions WHERE "deviceId" = '${deviceId}'`,
      )
    )[0];
    // return await this.sessionModel.findOne({ deviceId });
  }
}
