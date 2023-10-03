import { NotFoundException, UnauthorizedException } from '@nestjs/common';
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
              console.log(myStatus)
          }
      }
      const likesCount = foundedComment.likesInfo.usersWhoLiked.length
      const dislikesCount = foundedComment.likesInfo.usersWhoDisliked.length
      return {...(foundedComment.toObject()), likesInfo:{likesCount, dislikesCount, myStatus}}
  }

  async updateComment(newContent: string, postId:string){
    const comment = await this.commentModel.findOneAndUpdate({_id: new Types.ObjectId(postId)}, {$set: {content:newContent}})
    if(!comment){
      throw new NotFoundException()
    }
    return comment
  }

  async changeLikeStatus(request: Request, commentId: string, likeStatus: LikeStatus){
    const comment = await this.commentModel.findById(new Types.ObjectId(commentId))
    if(!comment){
      throw new NotFoundException()
    }
    const token = request.headers.authorization.split(' ')[1]
    const user : IUsersAcessToken= await this.jwtService.verifyAsync(token)

    switch(likeStatus){
      case LikeStatus.LIKE:
        comment.like(user.id)
        break;
      case LikeStatus.DISLIKE:
        comment.dislike(user.id)
        break;
      case LikeStatus.NONE:
        comment.removeStatus(user.id)
    }
    await comment.save()
    return
  }

  async deleteCommentById(id:string){
    const comment = await this.commentModel.findOneAndDelete({_id:new Types.ObjectId(id)})
    if(!comment){
      throw new NotFoundException('no such comment')
    }
    return
  }
}
