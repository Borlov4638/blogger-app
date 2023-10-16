import {
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from 'src/entyties/posts.schema';
import { Blog } from 'src/entyties/blogs.schema';


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
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) { }

  async execute(command: UpdatePostCommand) {
    command.data.blogId = new Types.ObjectId(command.data.blogId);

    const postToUpdate = await this.postModel.findById(
      new Types.ObjectId(command.postId),
    );
    if (!postToUpdate) {
      throw new NotFoundException('Post does not exists');
    }

    const blogToAssign = await this.blogModel.findById(command.data.blogId);
    if (!blogToAssign) {
      throw new NotFoundException('Blog does not exists');
    }
    postToUpdate.title = command.data.title;
    postToUpdate.shortDescription = command.data.shortDescription;
    postToUpdate.content = command.data.content;
    postToUpdate.blogId = command.data.blogId;

    await postToUpdate.save();
    return;
  }

}
