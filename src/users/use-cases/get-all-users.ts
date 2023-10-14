import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users.repository-pg';

interface IUsersPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
}

export class GetAllUsersCommand {
  constructor(public paganation: IUsersPaganationQuery) { }
}

@CommandHandler(GetAllUsersCommand)
export class GetAllUsersUseCase implements ICommandHandler<GetAllUsersCommand> {
  constructor(private usersRepository: UsersRepository) { }

  async execute(command: GetAllUsersCommand) {
    return await this.usersRepository.getAllUsers(command.paganation);
  }
}
