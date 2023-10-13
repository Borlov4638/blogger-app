import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionRepository } from 'src/auth/session.repository';

interface IUsersRefreshToken {
  id: string;
  email: string;
  login: string;
  deviceId: string;
}

@Injectable()
export class SecDevService {
  constructor(
    private jwtService: JwtService,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async getUserDevices(request: Request) {
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.cookies.refreshToken,
    );
    return await this.sessionRepo.getUserSessions(tokenData.id);
  }
  async deleteSessionById(request: Request, id: string) {
    const sessionToDelete = await this.sessionRepo.findSessionById(id);
    if (!sessionToDelete) {
      throw new NotFoundException();
    }
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.cookies.refreshToken,
    );
    const usersSessions = (
      await this.sessionRepo.getUserSessions(tokenData.id)
    ).map((session) => session.deviceId);
    if (usersSessions.indexOf(id) === -1) {
      throw new ForbiddenException();
    }
    await this.sessionRepo.deleteSessionById(id);
    return;
  }

  async deleteOtherSessions(request: Request) {
    const tokenData: IUsersRefreshToken = await this.jwtService.verifyAsync(
      request.cookies.refreshToken,
    );
    await this.sessionRepo.deleteOtherSessions(
      tokenData.id,
      tokenData.deviceId,
    );
    return;
  }
}
