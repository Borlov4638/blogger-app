import { BlogsRepository } from '../blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

interface IBlogPaganationQuery {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class GetAllBlogsCommand {
  constructor(public paganationQuery: IBlogPaganationQuery) { }
}

@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(
    private readonly blogsRepo: BlogsRepository,
  ) { }

  async execute(command: GetAllBlogsCommand) {
    return await this.blogsRepo.GetAllBlogs(command.paganationQuery)
  }
}