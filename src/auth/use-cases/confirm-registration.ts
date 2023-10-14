import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/users/users.repository-pg';

export class ConfirmRegistartionCommand {
  constructor(public code: string) { }
}

@CommandHandler(ConfirmRegistartionCommand)
export class ConfirmRegistartionUseCase
  implements ICommandHandler<ConfirmRegistartionCommand>
{
  constructor(private usersRepo: UsersRepository) { }
  async execute(command: ConfirmRegistartionCommand) {
    await this.usersRepo.confirmUserByCode(command.code);
  }
}
