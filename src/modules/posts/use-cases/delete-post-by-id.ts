import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepositoryPg } from '../posts.repository-orm';

export class DeletePostByIdCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase
  implements ICommandHandler<DeletePostByIdCommand>
{
  constructor(private postRepo: PostRepositoryPg) {}

  async execute(command: DeletePostByIdCommand) {
    const postToDelete = await this.postRepo.deletePostById(command.id);
    if (!postToDelete) {
      throw new NotFoundException('no such post');
    }
    return;
  }
}
