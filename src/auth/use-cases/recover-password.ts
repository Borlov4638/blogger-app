import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/users.repository-pg';

interface IPasswordRecovery {
  newPassword: string;
  recoveryCode: string;
}

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class RecoverPasswordCommand {
  constructor(public data: IPasswordRecovery) { }
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase
  implements ICommandHandler<RecoverPasswordCommand>
{
  constructor(
    private jwtService: JwtService,
    private usersRepo: UsersRepository,
  ) { }

  async execute(command: RecoverPasswordCommand) {
    const userData: IUsersAcessToken = await this._getTokenDataAndVerify(
      command.data.recoveryCode,
    );
    const user = await this.usersRepo.getUserByLoginOrEmail(userData.email);
    if (!user) {
      return;
    }
    await this.usersRepo.changePassword(command.data.newPassword, user);
    return;
  }

  private async _getTokenDataAndVerify(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
