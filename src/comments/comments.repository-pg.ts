import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment, CommentDocument, commentsSchema } from '../entyties/comments.schema';
import { LikeStatus } from "src/enums/like-status.enum";
import { UserDocument } from "src/entyties/users.chema";
import { DataSource, Like } from "typeorm";

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}


@Injectable()
export class CommentRepositoryPg {
    constructor(
        private dataSource: DataSource
    ) { }

    async createComment(commentatorInfo, content: string, postId: string) {
        const newComment = (await this.dataSource.query(`
            INSERT INTO comments ("content", "userId", "userLogin", "postId")
            VALUES ('${content}', '${commentatorInfo.userId}', '${commentatorInfo.userLogin}', '${postId}')
            RETURNING *
        `))[0]
        const comment = {
            id: newComment.id.toString(),
            content: newComment.content,
            commentatorInfo: {
                userId: newComment.userId.toString(),
                userLogin: newComment.userLogin
            },
            cretedAt: newComment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.NONE
            }
        }
        return comment
    }

    async getCommentById(id: string) {
        const findedComment = (await this.dataSource.query(`
            SELECT * FROM comments
            WHERE "id" = '${id}'
        `))[0]

        if (!findedComment) {
            return false
        }
        const commentLikes = (await this.dataSource.query(`
            SELECT from comments_likes
            WHERE "commentId" = '${id}' AND "status" = '${LikeStatus.LIKE}'
        `)).map(c => c.userId)
        const commentDislikes = (await this.dataSource.query(`
            SELECT from comments_likes
            WHERE "commentId" = '${id}' AND "status" = '${LikeStatus.DISLIKE}'
        `)).map(c => c.userId)

        const comment = {
            id: findedComment.id.toString(),
            content: findedComment.content,
            commentatorInfo: {
                userId: findedComment.userId.toString(),
                userLogin: findedComment.userLogin
            },
            cretedAt: findedComment.createdAt,
            likesInfo: {
                usersWhoLiked: commentLikes,
                usersWhoDisliked: commentDislikes
            }
        }
        return comment
    }

    async updateComment(commentId: string, newContent) {
        const updatedComment = (await this.dataSource.query(`
            UPDATE comments
            SET "content" = '${newContent}'
            WHERE "id" = '${commentId}'
            RETURNING *
        `))[0][0]
        if (!updatedComment) {
            return false
        }
        const comment = {
            id: updatedComment.id.toString(),
            content: updatedComment.content,
            commentatorInfo: {
                userId: updatedComment.userId.toString(),
                userLogin: updatedComment.userLogin
            },
            cretedAt: updatedComment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.NONE
            }
        }

        return comment
    }

    async deleteComment(comment) {
        await this.dataSource.query(`DELETE FROM comments WHERE "id" = '${comment.id}'`)
    }

    async getLikeStatus(commentId: string, userId: string) {
        const status = (await this.dataSource.query(`
            SELECT "status" FROM comments_likes
            WHERE "commentId" = '${commentId}'AND "userId" = '${userId}'
        `))[0]
        if (!status) {
            return LikeStatus.NONE
        }
        return status.status
    }

    async changeCommentsLikeStatus(likeStatus: LikeStatus, user: IUsersAcessToken, comment) {
        const status = await this.getLikeStatus(comment.id, user.id)

        switch (likeStatus) {
            case LikeStatus.LIKE:
                if (status === LikeStatus.LIKE) return
                try {
                    await this.removeStatus(user.id, comment.id)
                    await this.likeComment(user.id, comment.id)
                }
                catch {
                    return
                }
                break;
            case LikeStatus.DISLIKE:
                if (status === LikeStatus.DISLIKE) return
                try {
                    await this.removeStatus(user.id, comment.id)
                    await this.dislikeComment(user.id, comment.id);
                }
                catch {
                    return
                }
                break;
            case LikeStatus.NONE:
                await this.removeStatus(user.id, comment.id);
        }
        return

    }

    private async likeComment(userId: string, commentId: string) {
        await this.dataSource.query(`
            INSERT INTO comments_likes ("userId", "commentId", "status") 
            VALUES ('${userId}', '${commentId}', '${LikeStatus.LIKE}')
            RETURNING *
        `)
    }

    private async dislikeComment(userId: string, commentId: string) {
        await this.dataSource.query(`
            INSERT INTO comments_likes ("userId", "commentId", "status") 
            VALUES ('${userId}', '${commentId}', '${LikeStatus.DISLIKE}')
            RETURNING *
        `)
    }
    private async removeStatus(userId: string, commentId: string) {
        await this.dataSource.query(`
            DELETE FROM comments_likes
            WHERE "userId" = '${userId}' AND "commentId" = '${commentId}'
        `)
    }
}