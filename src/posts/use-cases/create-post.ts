import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';
import { PostRepositoryPg } from '../posts.repository-orm';
import { CreatePostDto } from '../dto/post.dto';
import { CreatePostByBlogIdDto } from 'src/blogs/dto/blogs.dto';

export class CreatePostCommand {
  constructor(
    public data: CreatePostDto | CreatePostByBlogIdDto,
    public blogId: string,
  ) {}
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private commandBus: CommandBus,
    private readonly postRepository: PostRepositoryPg,
  ) {}

  async execute(command: CreatePostCommand) {
    const blogToPost = await this.commandBus.execute(
      new GetBlogByIdCommand(command.blogId),
    );
    if (!blogToPost) {
      throw new NotFoundException();
    }
    return await this.postRepository.createPost(blogToPost, command.data);
  }
}
