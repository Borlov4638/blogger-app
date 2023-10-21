import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Comment, CommentDocument, commentsSchema } from '../entyties/comments.schema';
import { LikeStatus } from "src/enums/like-status.enum";
import { UserDocument } from "src/entyties/users.chema";
import { DataSource, Like } from "typeorm";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

interface IUsersAcessToken {
    id: string;
    email: string;
    login: string;
}



@Injectable()
export class CommentRepositoryPg {
    constructor(
        private dataSource: DataSource,
        private jwtService: JwtService
    ) { }

    commentsSortingQuery(sortBy: string): {} {
        switch (sortBy) {
            case 'id':
                return 'id';
            case 'content':
                return 'content';
            case 'createdAt':
                return 'createdAt';
            default:
                return 'createdAt';
        }
    }

    async getAllCommentsInPost(postsCommentsPaganation, postId: string, request: Request) {
        const sortBy = postsCommentsPaganation.sortBy
            ? postsCommentsPaganation.sortBy
            : 'createdAt';
        const sortDirection =
            postsCommentsPaganation.sortDirection === 'asc' ? 'asc' : 'desc';
        const sotringQuery = this.commentsSortingQuery(sortBy);
        const pageNumber = postsCommentsPaganation.pageNumber
            ? +postsCommentsPaganation.pageNumber
            : 1;
        const pageSize = postsCommentsPaganation.pageSize
            ? +postsCommentsPaganation.pageSize
            : 10;
        const itemsToSkip = (pageNumber - 1) * pageSize;
        let user: IUsersAcessToken
        let token: string;

        try {
            token = request.headers.authorization.split(' ')[1];
            user = this.jwtService.verify(token);
        }
        catch {
            user = { id: '0', email: '', login: '' }
        }

        const selectedComments = (await this.dataSource.query(`
            SELECT comments.*, COALESCE(comments_likes.status, 'None') as status,
            (SELECT COUNT(*) FROM comments_likes WHERE "commentId" = comments."id" AND status = 'Like') as like_count,
            (SELECT COUNT(*) FROM comments_likes WHERE "commentId" = comments."id" AND status = 'Dislike') as dislike_count
            FROM comments
            LEFT JOIN comments_likes
            ON comments."id" = comments_likes."commentId" AND comments_likes."userId" = '${user.id}'
            ORDER BY "${sotringQuery}" ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${itemsToSkip}
        `))

        const commentsToSend = selectedComments.map(c => {
            return {
                id: c.id.toString(),
                content: c.content,
                commentatorInfo: {
                    userId: c.userId.toString(),
                    userLogin: c.userLogin
                },
                createdAt: c.createdAt,
                likesInfo: {
                    likesCount: c.like_count,
                    dislikesCount: c.dislike_count,
                    myStatus: c.status
                }

            }
        })

        const totalCountOfItems = (await this.dataSource.query(`
            SELECT * FROM comments WHERE "postId" = '${postId}'
        `)).length;
        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountOfItems,
            items: [...commentsToSend],
        };
        return mappedResponse;

    }


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