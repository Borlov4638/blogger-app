import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class GetMyUsersDataCommand {
  constructor(public request: Request) {}
}

@CommandHandler(GetMyUsersDataCommand)
export class GetMyUsersDataUseCase
  implements ICommandHandler<GetMyUsersDataCommand>
{
  constructor(private readonly jwtService: JwtService) {}

  async execute(command: GetMyUsersDataCommand) {
    let user: IUsersAcessToken;
    try {
      const token = command.request.headers.authorization.split(' ')[1];
      user = await this.jwtService.verifyAsync(token);
    } catch {
      user = null;
    }
    if (!user) {
      throw new UnauthorizedException();
    }
    return { email: user.email, login: user.login, userId: user.id };
  }
}
