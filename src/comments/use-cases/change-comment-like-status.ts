import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from 'src/enums/like-status.enum';
import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CommentRepositoryPg } from '../comments.repository-pg';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class ChengeCommentLikeStatusCommand {
  constructor(
    public request: Request,
    public commentId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(ChengeCommentLikeStatusCommand)
export class ChengeCommentLikeStatusUseCase
  implements ICommandHandler<ChengeCommentLikeStatusCommand>
{
  constructor(
    private commentRepo: CommentRepositoryPg,
    private jwtService: JwtService,
  ) {}

  async execute(command: ChengeCommentLikeStatusCommand) {
    debugger;
    const comment = await this.commentRepo.getCommentById(command.commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    const token = command.request.headers.authorization.split(' ')[1];
    const user: IUsersAcessToken = await this.jwtService.verifyAsync(token);

    await this.commentRepo.changeCommentsLikeStatus(
      command.likeStatus,
      user,
      comment,
    );
    return;
  }
}
