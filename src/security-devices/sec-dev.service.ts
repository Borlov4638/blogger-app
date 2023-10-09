import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionService } from '../auth/sessions.service';

interface IUsersRefreshToken {
  id: string;
  email: string;
  login: string;
  deviceId: string;
}

@Injectable()
export class SecDevService {
  constructor(
    private readonly sessionService: SessionService,
  ) { }

  async getUserDevices(request: Request) {
    return await this.sessionService.getUserSessions(request);
  }
  async deleteSessionById(request: Request, id: string) {
    const sessionToDelete = await this.sessionService.findSessionById(id)
    if (!sessionToDelete) {
      throw new NotFoundException()
    }
    const usersSessions = (await this.sessionService.getUserSessions(request)).map(session => session.deviceId)
    if (usersSessions.indexOf(id) === -1) {
      throw new ForbiddenException()
    }
    await this.sessionService.deleteSessionById(id);
    return;
  }
}
