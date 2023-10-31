import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepositoryPg } from '../posts.repository-orm';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';

interface IPostUpdate {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostCommand {
  constructor(public postId: string, public data: IPostUpdate) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private commandBus: CommandBus,
    private postRepo: PostRepositoryPg,
  ) {}

  async execute(command: UpdatePostCommand) {
    const blogToAssign = await this.commandBus.execute(
      new GetBlogByIdCommand(command.data.blogId),
    );
    if (!blogToAssign) {
      throw new NotFoundException('Blog does not exists');
    }
    await this.postRepo.updatePost(command.postId, command.data, blogToAssign);
  }
}
