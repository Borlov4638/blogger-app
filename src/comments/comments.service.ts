import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../entyties/comments.schema';
import { Request } from 'express';
import { LikeStatus } from '../enums/like-status.enum';
import { JwtService } from '@nestjs/jwt';
interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private jwtService: JwtService,
  ) {}
  async getCommentById(id: string, request: Request) {
    const foundedComment = await this.commentModel.findById(
      new Types.ObjectId(id),
      { __v: false, _id: false, postId: false },
    );
    if (!foundedComment) {
      throw new NotFoundException();
    }

    let token: string;
    if (request.headers.authorization) {
      token = request.headers.authorization.split(' ')[1];
    }
    let user: IUsersAcessToken;
    let myStatus = LikeStatus.NONE;
    if (token) {
      try {
        user = this.jwtService.verify(token);
      } catch {
        user = null;
      }
      if (user) {
        myStatus = foundedComment.getLikeStatus(user.id);
      }
    }
    const likesCount = foundedComment.likesInfo.usersWhoLiked.length;
    const dislikesCount = foundedComment.likesInfo.usersWhoDisliked.length;
    return {
      ...foundedComment.toObject(),
      likesInfo: { likesCount, dislikesCount, myStatus },
    };
  }

  async updateComment(newContent: string, commentId: string, request: Request) {
    let user: IUsersAcessToken;
    try {
      const token = request.headers.authorization.split(' ')[1];
      user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }
    const comment = await this.commentModel.findOneAndUpdate(
      { _id: new Types.ObjectId(commentId) },
      { $set: { content: newContent } },
    );
    if (!comment) {
      throw new NotFoundException();
    }
    if (comment.commentatorInfo.userId !== user.id) {
      throw new ForbiddenException("You can't edit other users comments");
    }
    return comment;
  }

  async changeLikeStatus(
    request: Request,
    commentId: string,
    likeStatus: LikeStatus,
  ) {
    const comment = await this.commentModel.findById(
      new Types.ObjectId(commentId),
    );
    console.log('as');
    if (!comment) {
      throw new NotFoundException();
    }
    const token = request.headers.authorization.split(' ')[1];
    const user: IUsersAcessToken = await this.jwtService.verifyAsync(token);

    switch (likeStatus) {
      case LikeStatus.LIKE:
        comment.like(user.id);
        break;
      case LikeStatus.DISLIKE:
        comment.dislike(user.id);
        break;
      case LikeStatus.NONE:
        comment.removeStatus(user.id);
    }
    await comment.save();
    return;
  }

  async deleteCommentById(id: string, request: Request) {
    let user: IUsersAcessToken;
    try {
      const token = request.headers.authorization.split(' ')[1];
      user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }

    const comment = await this.commentModel.findById(new Types.ObjectId(id));
    if (!comment) {
      throw new NotFoundException('no such comment');
    }
    if (comment.commentatorInfo.userId !== user.id) {
      throw new ForbiddenException();
    }
    comment.deleteOne();
    return;
  }
}
