import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument, Types } from 'mongoose';
import { LikeStatus } from 'src/enums/like-status.enum';

export type CommentDocument = HydratedDocument<Comment>

@Schema()
export class Comment {
  @Prop()
  _id: Types.ObjectId;
  @Prop()
  id: Types.ObjectId;
  @Prop()
  content: string;
  @Prop({ type: { userId: String, userLogin: String }, _id:false })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  @Prop()
  createdAt: string;
  @Prop()
  postId: Types.ObjectId;
  @Prop({ type: { usersWhoLiked: [String], usersWhoDisliked: [String] },
    default:{usersWhoLiked:[], usersWhoDisliked:[]}, _id:false
  })
  likesInfo: {
    usersWhoLiked: Array<string>;
    usersWhoDisliked: Array<string>;
  };
  like:Function
  dislike:Function
  getLikeStatus:Function
}

export const commentsSchema = SchemaFactory.createForClass(Comment);

commentsSchema.methods.like = function (userId:string) {
  if(this.likesInfo.usersWhoLiked.indexOf(userId) === -1){
    this.likesInfo.usersWhoLiked.push(userId)
  }
  if(this.likesInfo.usersWhoDisliked.indexOf(userId) > -1){
    const index=this.likesInfo.usersWhoDisliked.indexOf(userId)
    this.likesInfo.usersWhoDisliked.splice(index, 1)
  }
}
commentsSchema.methods.dislike = function (userId:string) {
  if(this.likesInfo.usersWhoDisliked.indexOf(userId) === -1){
    this.likesInfo.usersWhoDisliked.push(userId)
  }
  if(this.likesInfo.usersWhoLiked.indexOf(userId) > -1){
    const index=this.likesInfo.usersWhoLiked.indexOf(userId)
    this.likesInfo.usersWhoLiked.splice(index, 1)
  }
}
commentsSchema.methods.removeStatus = function (userId:string){
  const indexOfLikes = this.likesInfo.usersWhoLiked.indexOf(userId)
  const indexOfDislikes = this.likesInfo.usersWhoDisliked.indexOf(userId)
  if(indexOfLikes > -1){
    this.likesInfo.usersWhoLiked.splice(indexOfLikes, 1)
  }else if(indexOfDislikes > -1){
    this.likesInfo.usersWhoDisliked.splice(indexOfLikes, 1)
  }  
}
commentsSchema.methods.getLikeStatus = function (userId:string) {
  const indexOfLikes = this.likesInfo.usersWhoLiked.indexOf(userId)
  const indexOfDislikes = this.likesInfo.usersWhoDisliked.indexOf(userId)
  if(indexOfLikes > -1){
    return LikeStatus.LIKE
  }else if(indexOfDislikes > -1){
    return LikeStatus.DISLIKE
  }else{
    return LikeStatus.NONE
  }
}

commentsSchema.pre('save', function(next){
  if(!this.createdAt){
    this.createdAt = new Date().toISOString()
  }
  if(!this._id){
    this._id = new Types.ObjectId()
    this.id = this._id
    next()
  }
})