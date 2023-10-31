import { BadRequestException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/use-cases/create-user';
import { UsersRepository } from '../../users/users.repository-orm';

interface INewUsersData {
  email: string;
  login: string;
  password: string;
}

export class RegistrateUserCommand {
  constructor(public data: INewUsersData) {}
}

@CommandHandler(RegistrateUserCommand)
export class RegistrateUserUseCase
  implements ICommandHandler<RegistrateUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private usersRepo: UsersRepository,
  ) {}

  async execute(command: RegistrateUserCommand) {
    const isUserExistsbyEmail = await this.usersRepo.getUserByLoginOrEmail(
      command.data.email,
    );
    if (isUserExistsbyEmail) {
      throw new BadRequestException('registration email');
    }
    const isUserExistsbyLogin = await this.usersRepo.getUserByLoginOrEmail(
      command.data.login,
    );
    if (isUserExistsbyLogin) {
      throw new BadRequestException('registration login');
    }
    return await this.commandBus.execute(
      new CreateUserCommand(command.data, false),
    );
  }
}
