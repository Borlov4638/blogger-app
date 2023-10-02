import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../entyties/comments.schema';
import { Request } from 'express';
import { LikeStatus } from 'src/enums/like-status.enum';
import { JwtService } from '@nestjs/jwt';
interface IUsersAcessToken{
  id:string
  email:string
  login:string
}

export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private jwtService :JwtService
  ) {}
  async getCommentById(id: string, request: Request) {
    const foundedComment = await this.commentModel.findById(
      new Types.ObjectId(id),
      {__v:false, _id:false}
    )
    if (!foundedComment) {
      throw new NotFoundException();
    }
    
    let token :string
    if(request.headers.authorization){
      token = request.headers.authorization.split(' ')[1]
    }
    
      let myStatus = LikeStatus.NONE
      if(token){
          const user : IUsersAcessToken = this.jwtService.verify(token)
          if(user){
              myStatus = foundedComment.getLikeStatus(user.id)
          }
      }
      const likesCount = foundedComment.likesInfo.usersWhoLiked.length
      const dislikesCount = foundedComment.likesInfo.usersWhoDisliked.length
      return {...(foundedComment.toObject()), likesInfo:{likesCount, dislikesCount, myStatus}}
  }
}
