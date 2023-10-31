import { Request } from 'express';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepositoryPg } from '../posts.repository-orm';

interface IPostPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class GetAllPostsCommand {
  constructor(
    public postPagonationQuery: IPostPaganationQuery,
    public request: Request,
  ) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private readonly postRepo: PostRepositoryPg) {}

  async execute(command: GetAllPostsCommand) {
    return await this.postRepo.getAllPosts(
      command.postPagonationQuery,
      command.request,
    );
  }
}
