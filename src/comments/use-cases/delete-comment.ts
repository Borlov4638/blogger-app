import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentRepositoryPg } from '../comments.repository-pg';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class DeleteCommentByIdCommand {
  constructor(public id: string, public request: Request) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommandByIdUseCase
  implements ICommandHandler<DeleteCommentByIdCommand>
{
  constructor(
    private commentRepo: CommentRepositoryPg,
    private jwtService: JwtService,
  ) {}

  async execute(command: DeleteCommentByIdCommand) {
    let user: IUsersAcessToken;
    try {
      const token = command.request.headers.authorization.split(' ')[1];
      user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }

    const comment = await this.commentRepo.getCommentById(command.id);
    if (!comment) {
      throw new NotFoundException('no such comment');
    }
    if (comment.commentatorInfo.userId !== user.id) {
      throw new ForbiddenException();
    }
    await this.commentRepo.deleteComment(comment);
    return;
  }
}
