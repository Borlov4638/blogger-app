import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from 'src/entyties/blogs.schema';

export class DeleteBlogByIdCommand {
  constructor(public blogId: string) { }
}


@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase implements ICommandHandler<DeleteBlogByIdCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
  ) { }

  async execute(command: DeleteBlogByIdCommand) {
    const blogToDelete = await this.blogModel.findOneAndDelete({
      _id: new Types.ObjectId(command.blogId),
    });
    if (!blogToDelete) {
      throw new NotFoundException('Could not find the Blog to Delete');
    }
    return;
  }

}
