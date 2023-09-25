import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, Types } from "mongoose";


@Schema()
export class Comment {
    @Prop()
    _id:Types.ObjectId
    @Prop()
    id:Types.ObjectId
    @Prop()
    content:string
    @Prop({type:{userId:String, userLogin:String}})
    commentatorInfo:{
        userId: string;
        userLogin: string;
    }
    @Prop({default:new Date().toISOString()})
    createdAt:string
    @Prop()
    postId:Types.ObjectId
    @Prop({type:{usersWhoLiked:[String], usersWhoDisliked:[String]}})
    likesInfo:{
        usersWhoLiked:Array<string>
        usersWhoDisliked: Array<string> 
    }
}

export const commentsSchema = SchemaFactory.createForClass(Comment)