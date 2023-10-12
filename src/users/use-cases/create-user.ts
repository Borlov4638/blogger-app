import { UtilsService } from '../../utils/utils.service';
import { CryptoService } from '../../crypto/crypto.service';
import { UsersRepository } from '../users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

interface ICreateUser {
  email: string;
  login: string;
  password: string;
}


export class CreateUserCommand {
  constructor(public data: ICreateUser, public isConfirmed: boolean) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly cryptoService: CryptoService,
    private usersRepository: UsersRepository,
    private utilsService: UtilsService
  ) { }

  async execute(command: CreateUserCommand) {
    const hashedPassword = await this.cryptoService.getHash(command.data.password, 10);
    const newUser = await this.usersRepository.createUser(command.data.login, command.data.email, hashedPassword, command.isConfirmed)
    if (!command.isConfirmed) {
      await this.utilsService.sendConfirmationViaEmail(
        command.data.email,
        newUser.emailConfirmation.confirmationCode,
      );
    }
    return newUser;
  }

}
