import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LikeStatus } from '../../enums/like-status.enum';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepositoryPg } from '../posts.repository-pg';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class GetPostByIdCommand {
  constructor(public postId: string, public request: Request) { }
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private postRepo: PostRepositoryPg,
    private readonly jwtService: JwtService,
  ) { }

  async execute(command: GetPostByIdCommand) {
    const findedPost = await this.postRepo.findPostById(command.postId)
    if (!findedPost) {
      throw new NotFoundException('no such post');
    }

    let user: IUsersAcessToken
    try {
      const decodedToken =
        command.request.headers.authorization.split(' ')[1];
      user = await this.jwtService.verifyAsync(decodedToken);
    } catch {
      user = null;
    }

    let myStatus = LikeStatus.NONE;
    if (user) {
      // myStatus = findedPost.getStatus(user.id);                  MONGO
      myStatus = await this.postRepo.getStatus(user.id, findedPost.id);

    }

    const newestLikes = findedPost.likesInfo.usersWhoLiked
      //@ts-ignore
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, 3);

    const extendedLikesInfo = {
      likesCount: findedPost.likesInfo.usersWhoLiked.length,
      dislikesCount: findedPost.likesInfo.usersWhoDisliked.length,
      myStatus,
      newestLikes: newestLikes.map((usr) => {
        return {
          userId: usr.userId.toString(),
          login: usr.login,
          addedAt: new Date(usr.addedAt).toISOString(),
        };
      }),
    };
    // const postToReturn = { ...findedPost.toObject() };       MONGO
    const postToReturn = { ...findedPost };

    delete postToReturn.likesInfo;
    return { ...postToReturn, extendedLikesInfo };

  }
}
