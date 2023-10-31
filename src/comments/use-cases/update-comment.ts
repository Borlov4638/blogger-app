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

export class UpdateCommentByIdCommand {
  constructor(
    public newContent: string,
    public commentId: string,
    public request: Request,
  ) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase
  implements ICommandHandler<UpdateCommentByIdCommand>
{
  constructor(
    private commentRepo: CommentRepositoryPg,
    private jwtService: JwtService,
  ) {}

  async execute(command: UpdateCommentByIdCommand) {
    let user: IUsersAcessToken;
    try {
      const token = command.request.headers.authorization.split(' ')[1];
      user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }
    const comment = await this.commentRepo.updateComment(
      command.commentId,
      command.newContent,
    );
    if (!comment) {
      throw new NotFoundException();
    }

    if (comment.commentatorInfo.userId !== user.id) {
      throw new ForbiddenException("You can't edit other users comments");
    }
    return comment;
  }
}
