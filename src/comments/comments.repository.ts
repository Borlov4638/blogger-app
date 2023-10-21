import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment, CommentDocument } from '../entyties/comments.schema';
import { LikeStatus } from "src/enums/like-status.enum";
import { UserDocument } from "src/entyties/users.chema";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}


@Injectable()
export class CommentRepository {
    constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>,
        private jwtService: JwtService
    ) { }

    commentsSortingQuery(sortBy: string, sortDirection: number): {} {
        switch (sortBy) {
            case 'id':
                return { id: sortDirection };
            case 'content':
                return { content: sortDirection };
            case 'createdAt':
                return { createdAt: sortDirection };
            default:
                return { createdAt: 1 };
        }
    }


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

    async getAllCommentsInPost(postsCommentsPaganation, postId: string, request: Request) {
        const sortBy = postsCommentsPaganation.sortBy
            ? postsCommentsPaganation.sortBy
            : 'createdAt';
        const sortDirection =
            postsCommentsPaganation.sortDirection === 'asc' ? 1 : -1;
        const sotringQuery = this.commentsSortingQuery(
            sortBy,
            sortDirection,
        );
        const pageNumber = postsCommentsPaganation.pageNumber
            ? +postsCommentsPaganation.pageNumber
            : 1;
        const pageSize = postsCommentsPaganation.pageSize
            ? +postsCommentsPaganation.pageSize
            : 10;
        const itemsToSkip = (pageNumber - 1) * pageSize;

        const selectedComments = await this.commentModel
            .find({ postId }, { _id: false, postId: false, __v: false })
            .sort(sotringQuery)
            .skip(itemsToSkip)
            .limit(pageSize);

        let token: string;
        if (request.headers.authorization) {
            token = request.headers.authorization.split(' ')[1];
        }
        const commentsToSend = selectedComments.map((comm) => {
            let myStatus = LikeStatus.NONE;
            let user: IUsersAcessToken;
            if (token) {
                try {
                    user = this.jwtService.verify(token);
                } catch {
                    user = null;
                }

                if (user) {
                    myStatus = comm.getLikeStatus(user.id);
                }
            }
            const likesCount = comm.likesInfo.usersWhoLiked.length;
            const dislikesCount = comm.likesInfo.usersWhoDisliked.length;
            return {
                ...comm.toObject(),
                likesInfo: { likesCount, dislikesCount, myStatus },
            };
        });
        const totalCountOfItems = (await this.commentModel.find({ postId })).length;
        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountOfItems,
            items: [...commentsToSend],
        };
        return mappedResponse;

    }
}