import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserByIdCommand {
  constructor(public id: string) { }
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase implements ICommandHandler<DeleteUserByIdCommand> {
  constructor(
    private usersRepository: UsersRepository,
  ) { }

  async execute(command: DeleteUserByIdCommand) {
    const deletedUser = await this.usersRepository.deleteUserById(command.id)
    if (!deletedUser) {
      throw new NotFoundException();
    }
    return;
  }
}
