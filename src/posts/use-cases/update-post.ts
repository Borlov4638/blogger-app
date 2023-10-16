import {
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from 'src/entyties/posts.schema';
import { Blog } from 'src/entyties/blogs.schema';
import { BlogsRepository } from 'src/blogs/blogs.repository';
import { PostRepository } from '../posts.repository';


interface IPostUpdate {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string | Types.ObjectId;
}

export class UpdatePostCommand {
  constructor(public postId: string, public data: IPostUpdate) { }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private postRepo: PostRepository
  ) { }

  async execute(command: UpdatePostCommand) {
    const blogToAssign = await this.blogModel.findById(command.data.blogId);
    if (!blogToAssign) {
      throw new NotFoundException('Blog does not exists');
    }
    this.postRepo.updatePost(command.postId, command.data)
  }

}
