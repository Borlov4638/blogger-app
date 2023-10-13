import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Request } from 'express';
import { SessionRepository } from 'src/auth/session.repository';

export class ValidateSessionCommand {
  constructor(public request: Request) {}
}

@CommandHandler(ValidateSessionCommand)
export class ValidateSessionUseCase
  implements ICommandHandler<ValidateSessionCommand>
{
  constructor(private sessionRepo: SessionRepository) {}

  async execute(command: ValidateSessionCommand) {
    const refreshHash = command.request.cookies.refreshToken.split('.')[2];
    const session = await this.sessionRepo.findSessionByRefreshHash(
      refreshHash,
    );
    if (!session) {
      throw new UnauthorizedException();
    }
    return session;
  }
}
