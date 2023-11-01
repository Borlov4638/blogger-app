import { Injectable } from '@nestjs/common';
import { LikeStatus } from 'src/enums/like-status.enum';
import { DataSource, Repository } from 'typeorm';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entitys/comment.entity';
import { CommentLikesEntity } from './entitys/comments-likes.entity';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

@Injectable()
export class CommentRepositoryPg {
  constructor(
    private dataSource: DataSource, private jwtService: JwtService,
    @InjectRepository(CommentEntity) private commentRepo: Repository<CommentEntity>
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

  async getAllCommentsInPost(
    postsCommentsPaganation,
    postId: string,
    request: Request,
  ) {
    const sortBy = postsCommentsPaganation.sortBy
      ? postsCommentsPaganation.sortBy
      : 'createdAt';
    const sortDirection =
      postsCommentsPaganation.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const sotringQuery = this.commentsSortingQuery(sortBy);
    const pageNumber = postsCommentsPaganation.pageNumber
      ? +postsCommentsPaganation.pageNumber
      : 1;
    const pageSize = postsCommentsPaganation.pageSize
      ? +postsCommentsPaganation.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    let user: IUsersAcessToken;
    let token: string;

    try {
      token = request.headers.authorization.split(' ')[1];
      user = this.jwtService.verify(token);
    } catch {
      user = { id: '0', email: '', login: '' };
    }

    const selectedComments = await this.commentRepo
      .createQueryBuilder("c")
      .select("c.*, COALESCE(cl.status, 'None') as status")
      .addSelect(query => {
        return query
          .select("COUNT(*)")
          .from("comments_likes", "cl")
          .where("cl.commentId = c.id")
          .andWhere("cl.status = 'Like'")
      }, "like_count")
      .addSelect(query => {
        return query
          .select("COUNT(*)")
          .from("comments_likes", "cl")
          .where("cl.commentId = c.id")
          .andWhere("cl.status = 'Dislike'")
      }, "dislike_count")
      .leftJoin(CommentLikesEntity, "cl", `c.id = cl.commentId AND cl.userId = '${user.id}'`)
      .where("c.postId = :postId", { postId })
      .orderBy(`c.${sotringQuery}`, `${sortDirection}`)
      .limit(pageSize)
      .offset(itemsToSkip)
      .getRawMany()

    const commentsToSend = selectedComments.map((c) => {
      return {
        id: c.id.toString(),
        content: c.content,
        commentatorInfo: {
          userId: c.userId.toString(),
          userLogin: c.userLogin,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount: parseInt(c.like_count),
          dislikesCount: parseInt(c.dislike_count),
          myStatus: c.status,
        },
      };
    });

    const totalCountOfItems = await this.commentRepo
      .createQueryBuilder("c")
      .select("c.*")
      .where("c.postId = :postId", { postId })
      .getCount()

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
    const newComment = new CommentEntity()
    newComment.postId = postId
    newComment.userId = commentatorInfo.userId
    newComment.userLogin = commentatorInfo.userLogin
    newComment.content = content
    await this.commentRepo.save(newComment)

    const comment = {
      id: newComment.id.toString(),
      content: newComment.content,
      commentatorInfo: {
        userId: commentatorInfo.userId.toString(),
        userLogin: commentatorInfo.userLogin,
      },
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
      },
    };
    return comment;
  }

  async getCommentById(id: string) {
    const findedComment = await this.commentRepo.findOne({
      where: {
        id
      },
      relations: {
        user: true
      }
    })

    if (!findedComment) {
      return false;
    }
    const commentLikes = await this.dataSource
      .createQueryBuilder()
      .select("cl.userId")
      .from(CommentLikesEntity, "cl")
      .where({ commentId: id })
      .andWhere({ status: LikeStatus.LIKE })
      .getMany()

    const commentDislikes = await this.dataSource
      .createQueryBuilder()
      .select("cl.userId")
      .from(CommentLikesEntity, "cl")
      .where({ commentId: id })
      .andWhere({ status: LikeStatus.DISLIKE })
      .getMany()

    const comment = {
      id: findedComment.id.toString(),
      content: findedComment.content,
      commentatorInfo: {
        userId: findedComment.user.id.toString(),
        userLogin: findedComment.userLogin,
      },
      createdAt: findedComment.createdAt,
      likesInfo: {
        usersWhoLiked: commentLikes,
        usersWhoDisliked: commentDislikes,
      },
    };
    return comment;
  }

  async updateComment(commentId: string, newContent) {

    const updatedComment = await this.commentRepo.findOne({
      relations: {
        user: true
      },
      where: {
        id: commentId
      }
    })
    if (!updatedComment) {
      return false;
    }

    updatedComment.content = newContent
    await this.commentRepo.save(updatedComment);

    const comment = {
      id: updatedComment.id.toString(),
      content: updatedComment.content,
      commentatorInfo: {
        userId: updatedComment.user.id.toString(),
        userLogin: updatedComment.userLogin,
      },
      createdAt: updatedComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
      },
    };

    return comment;
  }

  async deleteComment(comment) {
    await this.commentRepo.delete({ id: comment.id })
  }

  async getLikeStatus(commentId: string, userId: string) {
    const status = await this.dataSource
      .createQueryBuilder()
      .select("cl.status")
      .from(CommentLikesEntity, "cl")
      .where("cl.commentId = :commentId", { commentId })
      .andWhere("cl.userId = :userId", { userId })
      .getOne()

    if (!status) {
      return LikeStatus.NONE;
    }
    return status.status;
  }

  async changeCommentsLikeStatus(
    likeStatus: LikeStatus,
    user: IUsersAcessToken,
    comment,
  ) {
    const status = await this.getLikeStatus(comment.id, user.id);

    switch (likeStatus) {
      case LikeStatus.LIKE:
        if (status === LikeStatus.LIKE) return;
        try {
          await this.removeStatus(user.id, comment.id);
          await this.likeComment(user.id, comment.id);
        } catch {
          return;
        }
        break;
      case LikeStatus.DISLIKE:
        if (status === LikeStatus.DISLIKE) return;
        try {
          await this.removeStatus(user.id, comment.id);
          await this.dislikeComment(user.id, comment.id);
        } catch {
          return;
        }
        break;
      case LikeStatus.NONE:
        await this.removeStatus(user.id, comment.id);
    }
    return;
  }

  private async likeComment(userId: string, commentId: string) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(CommentLikesEntity)
      .values({ userId, commentId, status: LikeStatus.LIKE })
      .execute()

  }

  private async dislikeComment(userId: string, commentId: string) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(CommentLikesEntity)
      .values({ commentId, userId, status: LikeStatus.DISLIKE })
      .execute()
  }
  private async removeStatus(userId: string, commentId: string) {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(CommentLikesEntity)
      .where("userId = :userId", { userId })
      .andWhere("commentId = :commentId", { commentId })
      .execute()

  }
}
