import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { LikeStatus } from "../enums/like-status.enum";



export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    @Prop()
    _id:Types.ObjectId
    @Prop()
    id:Types.ObjectId
    @Prop()
    title:string
    @Prop()
    shortDescription:string
    @Prop()
    content:string
    @Prop()
    blogId: Types.ObjectId
    @Prop()
    blogName: string
    @Prop({default: new Date()})
    createdAt:Date
    @Prop({type:{usersWhoLiked:[{userId:String, login:String, addedAt: Number}], usersWhoDisliked:[String]},
      default:{usersWhoLiked:[], usersWhoDisliked:[]}, _id:false
    })
    likesInfo:{
        usersWhoLiked:[{
          userId: string,
          login: string,
          addedAt: number
        }]
        useusersWhoDisliked:string[]
    }
    @Prop({type:{likesCount:Number, dislikesCount:Number, myStatus:String, newestLikes:[{addedAt:String, userId:String, login:String}]},
     default:{likesCount:0, dislikesCount:0, myStatus:LikeStatus.NONE,newestLikes:[]}, _id:false
    })
    extendedLikesInfo: {
      likesCount: number,
      dislikesCount: number,
      myStatus:LikeStatus
      newestLikes:[{
        addedAt:string,
        userId:string
        login:string
      }]
    }
}

export const postSchema = SchemaFactory.createForClass(Post)

postSchema.pre('save', function (next) {
    if (!this._id) {
      this._id = this.id = new Types.ObjectId();
    }
    next();
  });
  