import { Request } from 'express';
import { add } from 'date-fns';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepositoryPg } from '../../../auth/session.repository-orm';

export class CreateSessionCommand {
  constructor(
    public req: Request,
    public user: any,
    public expDate: number,
    public deviceId: string,
    public refreshHash: string,
  ) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(private sessionRepo: SessionRepositoryPg) {}

  async execute(command: CreateSessionCommand) {
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

    const newSession = await this.sessionRepo.createSession(
      command.user,
      command.deviceId,
      requestIp,
      userAgent,
      lastActiveDate,
      refreshTokenExpirationDate,
      command.refreshHash,
    );
    return newSession;
  }
}
