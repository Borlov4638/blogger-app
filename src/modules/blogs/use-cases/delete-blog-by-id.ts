import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryPg } from '../blogs.repository-orm';

export class DeleteBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(private blogRepo: BlogsRepositoryPg) {}

  async execute(command: DeleteBlogByIdCommand) {
    const blogToDelete = await this.blogRepo.deleteBlogById(command.blogId);

    if (!blogToDelete) {
      throw new NotFoundException('Could not find the Blog to Delete');
    }
    return;
  }
}
