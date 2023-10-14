import { Request } from 'express';
import { add } from 'date-fns';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepositoryPg } from '../../../auth/session.repository-pg';

export class RefreshCurrentSessionCommand {
  constructor(
    public req: Request,
    public expDate: number,
    public deviceId: string,
    public refreshHash: string,
  ) { }
}

@CommandHandler(RefreshCurrentSessionCommand)
export class RefreshCurrentSessionUseCase
  implements ICommandHandler<RefreshCurrentSessionCommand>
{
  constructor(private sessionRepo: SessionRepositoryPg) { }

  async execute(command: RefreshCurrentSessionCommand) {
    const requestIp =
      (command.req.headers['x-forwarded-for'] as string) ||
      command.req.socket.remoteAddress!;

    const userAgent = command.req.headers['user-agent']
      ? command.req.headers['user-agent']
      : 'Chrome 105';

    const refreshTokenExpirationDate = add(new Date(), {
      seconds: command.expDate,
    }).toISOString();

    const lastActiveDate = Math.floor(+new Date() / 1000) * 1000;

    return await this.sessionRepo.refreshCurrentSession(
      command.deviceId,
      requestIp,
      userAgent,
      refreshTokenExpirationDate,
      command.refreshHash,
      lastActiveDate,
    );
  }
}
