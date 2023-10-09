import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from '../../entyties/blogs.schema';

interface IUpdateBlog {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogByIdCommand {
  constructor(public blogId: string, public data: IUpdateBlog) { }
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdUseCase implements ICommandHandler<UpdateBlogByIdCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) { }


  async execute(command: UpdateBlogByIdCommand) {
    const blogToUpdate = await this.blogModel.findById(
      new Types.ObjectId(command.blogId),
    );
    if (!blogToUpdate) {
      throw new NotFoundException();
    }
    blogToUpdate.name = command.data.name;
    blogToUpdate.description = command.data.description;
    blogToUpdate.websiteUrl = command.data.websiteUrl;
    await blogToUpdate.save();
    return;
  }


}
