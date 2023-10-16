import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';
import { PostRepositoryPg } from '../posts.repository-pg';

interface ICreatePost {
  title: string;
  shortDescription: string;
  content: string;
}

export class CreatePostCommand {
  constructor(public data: ICreatePost, public blogId: string) { }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private commandBus: CommandBus,
    private readonly postRepository: PostRepositoryPg
  ) { }

  async execute(command: CreatePostCommand) {
    const blogToPost = await this.commandBus.execute(new GetBlogByIdCommand(command.blogId))
    if (!blogToPost) {
      throw new NotFoundException();
    }
    return await this.postRepository.createPost(blogToPost, command.data)
  }
}
