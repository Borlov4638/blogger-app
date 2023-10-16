import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class GetBlogByIdCommand {
  constructor(public blogId: string) { }
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    private blogRepo: BlogsRepository
  ) { }

  async execute(command: GetBlogByIdCommand) {
    const findedBlog = this.blogRepo.getBlogById(command.blogId)
    if (!findedBlog) {
      throw new NotFoundException();
    }
    return findedBlog;
  }
}
