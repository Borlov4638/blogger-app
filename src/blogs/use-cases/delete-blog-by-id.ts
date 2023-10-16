import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class DeleteBlogByIdCommand {
  constructor(public blogId: string) { }
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(private blogRepo: BlogsRepository) { }

  async execute(command: DeleteBlogByIdCommand) {
    const blogToDelete = this.blogRepo.deleteBlogById(command.blogId)
    if (!blogToDelete) {
      throw new NotFoundException('Could not find the Blog to Delete');
    }
    return;
  }

}
