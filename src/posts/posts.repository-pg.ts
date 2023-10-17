import { NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { InjectDataSource } from "@nestjs/typeorm";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { Post, PostDocument } from "src/entyties/posts.schema";
import { UserDocument } from "src/entyties/users.chema";
import { LikeStatus } from "src/enums/like-status.enum";
import { DataSource, Like } from "typeorm";

interface IPostPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export interface IPostsLikes {
  postId: number
  userId: number
  addedAt: string
  login: string
  status: LikeStatus
}

export interface IPostPostgres {
  id: number
  createdAt: string
  title: string
  shortDescription: string
  content: string
  blogId: number
}

export class PostRepositoryPg {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private jwtService: JwtService
  ) { }

  postsSortingQuery(sortBy: string, sortDirection: number): {} {
    switch (sortBy) {
      case 'id':
        return { id: sortDirection };
      case 'title':
        return { title: sortDirection };
      case 'shortDescription':
        return { shortDescription: sortDirection };
      case 'content':
        return { content: sortDirection };
      case 'blogId':
        return { blogId: sortDirection };
      case 'blogName':
        return { blogName: sortDirection };
      case 'createdAt':
        return { createdAt: sortDirection };
      default:
        return { createdAt: 1 };
    }
  }
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

  async getAllPosts(postPagonationQuery: IPostPaganationQuery, request: Request) {
    const sortBy = postPagonationQuery.sortBy
      ? postPagonationQuery.sortBy
      : 'createdAt';
    const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 'asc' : 'desc';
    // const sotringQuery = this.postsSortingQuery(sortBy);
    const pageNumber = postPagonationQuery.pageNumber
      ? +postPagonationQuery.pageNumber
      : 1;
    const pageSize = postPagonationQuery.pageSize
      ? +postPagonationQuery.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    const findedPosts: IPostPostgres[] = await this.dataSource.query(`
      SELECT * FROM posts
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${itemsToSkip}
    `)
    console.log(findedPosts)
    const postToReturn = findedPosts.map(p => {
      // const postsLikes: IPostsLikes[] = await this.dataSource.query(`SELECT * FROM posts_likes WHERE "postId" = '${p.id}'`)

      const post =
      {
        ...p,
        id: p.id.toString(),
        blogId: p.blogId.toString(),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.NONE
        }
      }
      return post
    })
    // const findedPosts = await this.postModel
    //   .find({}, { _id: false, __v: false })
    //   .sort(sotringQuery)
    //   .skip(itemsToSkip)
    //   .limit(pageSize);

    // const token = request.headers.authorization;

    let myStatus: string = LikeStatus.NONE;
    let user: IUsersAcessToken;
    // const postsToShow = findedPosts.map((post) => {
    //   if (token) {
    //     try {
    //       user = this.jwtService.verify(
    //         request.headers.authorization.split(' ')[1],
    //       );
    //     } catch {
    //       user = null;
    //     }
    //     if (user) {
    //       console.log(post);
    //       myStatus = post.getStatus(user.id);
    //     }
    //   }
    //   const newestLikes = post.likesInfo.usersWhoLiked
    //     //@ts-ignore
    //     .sort((a, b) => b.addedAt - a.addedAt)
    //     .slice(0, 3);

    //   const extendedLikesInfo = {
    //     likesCount: post.likesInfo.usersWhoLiked.length,
    //     dislikesCount: post.likesInfo.usersWhoDisliked.length,
    //     myStatus,
    //     newestLikes: newestLikes.map((usr) => {
    //       return {
    //         userId: usr.userId,
    //         login: usr.login,
    //         addedAt: new Date(usr.addedAt).toISOString(),
    //       };
    //     }),
    //   };
    //   const postToReturn = { ...post.toObject() };
    //   delete postToReturn.likesInfo;
    //   console.log(extendedLikesInfo);
    //   return { ...postToReturn, extendedLikesInfo };
    // });

    const totalCountOfItems = (await this.dataSource.query(`SELECT * FROM posts`)).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...postToReturn],
    };

    return mappedResponse;
  }

  async createPost(blogToPost, data) {
    const post: IPostPostgres = (await this.dataSource.query(`INSERT INTO posts ("title", "shortDescription", "content", "blogId") 
    VALUES ('${data.title}', '${data.shortDescription}', '${data.content}', '${blogToPost.id}')
    RETURNING *
    `))[0]
    const postToReturn = {
      ...post,
      id: post.id.toString(),
      blogId: post.blogId.toString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE
      }
    }
    return postToReturn
  }

  async findPostById(postId: string) {
    const post: IPostPostgres = (await this.dataSource.query(`SELECT * FROM posts WHERE "id" = '${postId}'`))[0]
    if (!post) {
      return false
    }
    const postsLikes: IPostsLikes[] = await this.dataSource.query(`SELECT * FROM posts_likes WHERE "postId" = '${postId}'`)

    const postToReturn = {
      ...post,
      blogId: post.blogId.toString(),
      id: post.id.toString(),
      likesInfo: {
        usersWhoLiked: postsLikes.filter(l => {
          return l.status === LikeStatus.LIKE
        }),
        usersWhoDisliked: postsLikes.filter(l => {
          return l.status === LikeStatus.LIKE
        }),
      }
    }
    return postToReturn

  }

  async getPostsByBlogPagonation(pagonation, blogId) {
    // return await this.postModel
    //   .find({ blogId }, { _id: false, __v: false })
    //   .sort(pagonation.sotringQuery)
    //   .skip(pagonation.itemsToSkip)
    //   .limit(pagonation.pageSize);
    return {} as PostDocument[]
  }
  async getAllPostsByBlogId(blogId: string) {
    // return await this.postModel.find({ blogId })
    return {} as PostDocument[]
  }

  async updatePost(postId, data) {
    const updatedPost = await this.dataSource.query(`UPDATE posts 
      SET "title" = '${data.title}', "shortDescription" = '${data.shortDescription}', "content" = '${data.content}', "blogId" = '${data.blogId}'
      WHERE "id" = '${postId}'
      RETURNING *
    `)
    if (!updatedPost[1]) {
      throw new NotFoundException('Post does not exists')
    }
    return;
  }

  async deletePostById(id: string) {
    return (await this.dataSource.query(`DELETE FROM posts WHERE "id" = '${id}'`))[1]
  }

  getStatus(userId: string) {
    return LikeStatus.NONE
  }
}
