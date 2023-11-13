import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryPg } from '../blogs.repository-orm';

interface IUpdateBlog {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogByIdCommand {
  constructor(public blogId: string, public data: IUpdateBlog) {}
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdUseCase
  implements ICommandHandler<UpdateBlogByIdCommand>
{
  constructor(private blogRepo: BlogsRepositoryPg) {}

  async execute(command: UpdateBlogByIdCommand) {
    const isBlogUpdated = await this.blogRepo.updateBlogById(
      command.blogId,
      command.data,
    );
    if (!isBlogUpdated) {
      throw new NotFoundException();
    }
    return;
  }
}
