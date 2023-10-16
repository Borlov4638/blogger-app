import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

interface IUpdateBlog {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogByIdCommand {
  constructor(public blogId: string, public data: IUpdateBlog) { }
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdUseCase
  implements ICommandHandler<UpdateBlogByIdCommand>
{
  constructor(
    private blogRepo: BlogsRepository
  ) { }

  async execute(command: UpdateBlogByIdCommand) {
    const isBlogUpdated = this.blogRepo.updateBlogById(command.blogId, command.data)
    if (!isBlogUpdated) {
      throw new NotFoundException();
    }
    return;
  }
}
