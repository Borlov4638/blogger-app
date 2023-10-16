import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from '../../entyties/blogs.schema';
import { Post, PostDocument } from '../../entyties/posts.schema';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';
import { PostRepository } from '../posts.repository';

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
    private readonly postRepository: PostRepository
  ) { }

  async execute(command: CreatePostCommand) {
    const blogToPost = await this.commandBus.execute(new GetBlogByIdCommand(command.blogId))
    if (!blogToPost) {
      throw new NotFoundException();
    }
    return await this.postRepository.createPost(blogToPost, command.data)
  }
}
