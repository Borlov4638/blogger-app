import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { LikeStatus } from 'src/enums/like-status.enum';
import { JwtService } from '@nestjs/jwt';
import { CommentRepositoryPg } from '../comments.repository-orm';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class GetCommentByIdCommand {
  constructor(public id: string, public request: Request) { }
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase
  implements ICommandHandler<GetCommentByIdCommand>
{
  constructor(
    private commentRepo: CommentRepositoryPg,
    private jwtService: JwtService,
  ) { }

  async execute(command: GetCommentByIdCommand) {
    debugger;
    const foundedComment = await this.commentRepo.getCommentById(command.id);

    if (!foundedComment) {
      throw new NotFoundException();
    }

    let token: string;
    if (command.request.headers.authorization) {
      token = command.request.headers.authorization.split(' ')[1];
    }
    let user: IUsersAcessToken;
    let myStatus = LikeStatus.NONE;
    if (token) {
      try {
        user = await this.jwtService.verifyAsync(token);
      } catch {
        user = null;
      }
      if (user) {
        //   myStatus = foundedComment.getLikeStatus(user.id);      MONGO
        myStatus = await this.commentRepo.getLikeStatus(
          foundedComment.id,
          user.id,
        );
      }
    }
    const likesCount = foundedComment.likesInfo.usersWhoLiked.length;
    const dislikesCount = foundedComment.likesInfo.usersWhoDisliked.length;
    return {
      // ...foundedComment.toObject(),                                MONGO
      ...foundedComment,
      likesInfo: { likesCount, dislikesCount, myStatus },
    };
  }
}
