import { NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment } from "src/entyties/comments.schema";

export class CommentsService{
    constructor(@InjectModel(Comment.name) private commentModel : Model<Comment>){}
    async getCommentById(id: string){
        const foundedComment = await this.commentModel.findById(new Types.ObjectId(id))
        if(!foundedComment){
            throw new NotFoundException()
        }
        return foundedComment
    }
}