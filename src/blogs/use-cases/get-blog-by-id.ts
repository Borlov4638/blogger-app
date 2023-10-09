import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from 'src/entyties/blogs.schema';


export class GetBlogByIdCommand {
  constructor(public blogId: string) { }
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,

  ) { }

  async execute(command: GetBlogByIdCommand) {
    const findedBlog = await this.blogModel
      .findById(
        new Types.ObjectId(command.blogId),
        { _id: false, __v: false },
        { lean: true },
      )
      .exec();
    if (!findedBlog) {
      throw new NotFoundException();
    }
    return findedBlog;
  }
}
