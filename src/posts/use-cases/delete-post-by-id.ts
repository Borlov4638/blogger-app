import {
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../entyties/posts.schema';

export class DeletePostByIdCommand {
  constructor(public readonly id: string) { }
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase implements ICommandHandler<DeletePostByIdCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) { }

  async execute(command: DeletePostByIdCommand) {
    const postToDelete = await this.postModel.findOneAndDelete({
      _id: new Types.ObjectId(command.id),
    });
    if (!postToDelete) {
      throw new NotFoundException('no such post');
    }
    return;
  }

}
