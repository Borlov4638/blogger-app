import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SessionPg } from './enities/session.entitie';
import { UsersEntity } from 'src/users/entyties/users.entytie';

@Injectable()
export class SessionRepositoryPg {
  constructor(
    @InjectRepository(SessionPg) private sessionRepo: Repository<SessionPg>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createSession(
    userId: UsersEntity,
    deviceId: string,
    ip: string,
    title: string,
    lastActiveDate: number,
    expiration: string,
    refreshHash: string,
  ) {
    const session = new SessionPg();
    session.deviceId = deviceId;
    session.expiration = expiration;
    session.ip = ip;
    session.lastActiveDate = lastActiveDate;
    session.refreshHash = refreshHash;
    session.title = title;
    session.user = userId;
    await this.sessionRepo.save(session);
  }

  async findSessionByRefreshHash(refreshHash: string) {
    return await this.sessionRepo.findOneBy({ refreshHash });
  }

  async refreshCurrentSession(
    deviceId: string,
    ip: string,
    title: string,
    expiration: string,
    refreshHash: string,
    lastActiveDate: number,
  ) {
    await this.sessionRepo.update(
      { deviceId },
      { ip, title, expiration, refreshHash, lastActiveDate },
    );
  }
  async deleteSessionById(deviceId: string) {
    return (await this.sessionRepo.delete({ deviceId }))[1];
  }
  async getUserSessions(userId: string) {
    const sessions = (await this.sessionRepo
      .createQueryBuilder('sessions')
      .select([
        'sessions.deviceId',
        'sessions.ip',
        'sessions.lastActiveDate',
        'sessions.title',
      ])
      .where('sessions.userId = :userId', { userId })
      .getMany()) as Array<any>;

    sessions.map((s) => {
      s.lastActiveDate = new Date(
        (s.lastActiveDate / 1000) * 1000,
      ).toISOString();
    });
    return sessions;
  }

  async deleteOtherSessions(userId: string, deviceId: string) {
    const res = await this.sessionRepo
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId })
      .execute();
    return;
  }

  async findSessionById(deviceId: string) {
    return await this.sessionRepo.findOneBy({ deviceId });
  }
}
