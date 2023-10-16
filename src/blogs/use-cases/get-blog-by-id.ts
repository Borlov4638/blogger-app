import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryPg } from '../blogs.repository-pg';

export class GetBlogByIdCommand {
  constructor(public blogId: string) { }
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    private blogRepo: BlogsRepositoryPg
  ) { }

  async execute(command: GetBlogByIdCommand) {
    const findedBlog = await this.blogRepo.getBlogById(command.blogId)
    if (!findedBlog) {
      throw new NotFoundException();
    }
    return findedBlog;
  }
}
