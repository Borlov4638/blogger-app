import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';
import { PostRepositoryPg } from '../posts.repository-orm';

export interface IPostPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class GetAllPostsInBlogCommand {
  constructor(
    public postPagonationQuery: IPostPaganationQuery,
    public blogId: string,
    public request: Request,
  ) { }
}

@CommandHandler(GetAllPostsInBlogCommand)
export class GetAllPostsInBlogUseCase
  implements ICommandHandler<GetAllPostsInBlogCommand>
{
  constructor(

    private commandBus: CommandBus,
    private readonly postRepo: PostRepositoryPg,
  ) { }

  async execute(command: GetAllPostsInBlogCommand) {
    const blogToFindPosts = await this.commandBus.execute(new GetBlogByIdCommand(command.blogId))
    if (!blogToFindPosts) {
      throw new NotFoundException();
    }
    return await this.postRepo.getAllPostsInBlog(command.postPagonationQuery, command.blogId, command.request)
  }

}