import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';
import { DeletePostByIdCommand } from './delete-post-by-id';

export class DeletePostInBlogCommand {
  constructor(public blogId, public postId) {}
}

@CommandHandler(DeletePostInBlogCommand)
export class DeletePostInBlogsUseCase
  implements ICommandHandler<DeletePostInBlogCommand>
{
  constructor(private commandBus: CommandBus) {}

  async execute(command: DeletePostInBlogCommand) {
    const blogToFindPosts = await this.commandBus.execute(
      new GetBlogByIdCommand(command.blogId),
    );
    if (!blogToFindPosts) {
      throw new NotFoundException();
    }
    return this.commandBus.execute(new DeletePostByIdCommand(command.postId));
  }
}
