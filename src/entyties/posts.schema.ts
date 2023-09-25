import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


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
    @Prop({type:{usersWhoLiked:[{userId:String, string: String, login:String, addedAt: Number}], usersWhoDisliked:[]}})
    extendedLikesInfo:{
        usersWhoLiked:[]
        useusersWhoDisliked:[]
    }
}

export const postSchema = SchemaFactory.createForClass(Post)

postSchema.pre('save', function (next) {
    if (!this._id) {
      this._id = this.id = new Types.ObjectId();
    }
    next();
  });
  