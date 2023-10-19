import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment, CommentDocument } from '../entyties/comments.schema';
import { LikeStatus } from "src/enums/like-status.enum";
import { UserDocument } from "src/entyties/users.chema";

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}


@Injectable()
export class CommentRepository {
    constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) { }

    async createComment(commentatorInfo, content: string, postId: string) {

        const comment = new this.commentModel({ commentatorInfo, content, postId });

        return await comment.save().then((comment) => {
            const plainComment: CommentDocument = comment.toObject();
            delete plainComment._id;
            delete plainComment.__v;
            delete plainComment.likesInfo;
            delete plainComment.postId;
            return {
                ...plainComment,
                likesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.NONE,
                },
            };
        });
    }

    async getCommentById(id: string) {
        return await this.commentModel.findById(
            new Types.ObjectId(id),
            { __v: false, _id: false, postId: false },
        );
    }

    async getLikeStatus(commentId: string, userId: string) {
        return LikeStatus.NONE
    }

    async updateComment(commentId: string, newContent) {
        return await this.commentModel.findOneAndUpdate(
            { _id: new Types.ObjectId(commentId) },
            { $set: { content: newContent } },
        );
    }

    async changeCommentsLikeStatus(likeStatus: LikeStatus, user: IUsersAcessToken, comment: CommentDocument) {
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
        return

    }

    async deleteComment(comment: CommentDocument) {
        await comment.deleteOne();
    }
}