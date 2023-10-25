import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../users/users.repository-orm';
import { UtilsService } from '../../utils/utils.service';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class SendPassRecoveryCodeCommand {
  constructor(public email: string) { }
}
@CommandHandler(SendPassRecoveryCodeCommand)
export class SendPassRecoveryCodeUseCase
  implements ICommandHandler<SendPassRecoveryCodeCommand>
{
  constructor(
    private utilsService: UtilsService,
    private jwtService: JwtService,
    private usersRepo: UsersRepository,
  ) { }

  async execute(command: SendPassRecoveryCodeCommand) {
    const user = await this.usersRepo.getUserByLoginOrEmail(command.email);
    if (!user) {
      return;
    }
    const code = await this.generateCode(user, 1800);
    await this.utilsService.sendPassRecoweryMail(user.email, code);
    return;
  }
  async generateCode(user: IUsersAcessToken, exp: number | string) {
    return await this.jwtService.signAsync(
      { id: user.id, email: user.email, login: user.login },
      { expiresIn: exp },
    );
  }
}
