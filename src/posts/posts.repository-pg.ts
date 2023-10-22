import { NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectDataSource } from "@nestjs/typeorm";
import { Request } from "express";
import { LikeStatus } from "src/enums/like-status.enum";
import { DataSource } from "typeorm";

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

  postsSortingQuery(sortBy: string): {} {
    switch (sortBy) {
      case 'id':
        return 'id';
      case 'title':
        return 'title';
      case 'shortDescription':
        return 'shortDescription';
      case 'content':
        return 'content';
      case 'blogId':
        return 'blogId';
      case 'blogName':
        return 'blogName';
      case 'createdAt':
        return 'createdAt';
      default:
        return 'createdAt';
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
    const sotringQuery = this.postsSortingQuery(sortBy);
    const pageNumber = postPagonationQuery.pageNumber
      ? +postPagonationQuery.pageNumber
      : 1;
    const pageSize = postPagonationQuery.pageSize
      ? +postPagonationQuery.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    let user: IUsersAcessToken;
    try {
      user = await this.jwtService.verifyAsync(
        request.headers.authorization.split(' ')[1],
      );
    }
    catch {
      user = { id: '0', email: '', login: '' }
    }

    const findedPosts = await this.dataSource.query(`
      SELECT posts.*, blogs.name AS "blogName",
      COALESCE((SELECT status from posts_likes WHERE "userId" = '${user.id}' AND "postId" = posts."id"), 'None') as status,
      COALESCE((
        SELECT json_agg(row) 
        FROM (
            SELECT "addedAt", "userId", "login"
            FROM posts_likes
            WHERE "postId" = posts."id" AND "status" = 'Like'
            ORDER BY "addedAt" desc
        ) row
      ),'[]') as likes_array,
      COALESCE((
          SELECT json_agg(row) 
          FROM (
              SELECT posts_likes.*
              FROM posts_likes
              WHERE "postId" = posts."id" AND "status" = 'Dislike'
          ) row
      ),'[]') as dislikes_array      
      FROM posts
      LEFT JOIN blogs
      ON posts."blogId" = blogs."id"
      GROUP BY posts."id", blogs."name"
      ORDER BY "${sotringQuery}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${itemsToSkip}
    `)
    console.log(findedPosts)
    const postToReturn = findedPosts.map(p => {
      const post =
      {

        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: p.likes_array.length,
          dislikesCount: p.dislikes_array.length,
          myStatus: p.status,
          newestLikes: p.likes_array.slice(0, 2).map(u => { return { ...u, userId: u.userId.toString() } })
        },
      }
      return post
    })

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
    const createdPost: IPostPostgres = (await this.dataSource.query(`INSERT INTO posts ("title", "shortDescription", "content", "blogId") 
    VALUES ('${data.title}', '${data.shortDescription}', '${data.content}', '${blogToPost.id}')
    RETURNING *
    `))[0]

    const post = (await this.dataSource.query(`
      SELECT posts.*, blogs.name as "blogName"
      FROM posts
      left join blogs
      on posts."blogId" = blogs."id"
      WHERE posts."id" = '${createdPost.id}'
    `))[0]
    const postToReturn = {
      ...post,
      id: post.id.toString(),
      blogId: post.blogId.toString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
        newestLikes: []
      },
    }
    return postToReturn
  }

  async findPostById(postId: string) {
    const post: IPostPostgres = (await this.dataSource.query(`
      SELECT posts.*, blogs.name as "blogName"
      FROM posts
      left join blogs
      on posts."blogId" = blogs.id
      WHERE posts."id" = '${postId}'
    `))[0]
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
          return l.status === LikeStatus.DISLIKE
        }),
      }
    }
    return postToReturn

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

  async getStatus(userId: string, postId: string) {
    const status = (await this.dataSource.query(`
      SELECT "status"
      FROM posts_likes
      WHERE "postId" = '${postId}' AND "userId" = '${userId}'
    `))[0]

    return !status ? LikeStatus.NONE : status.status
  }


  async getAllPostsInBlog(postPagonationQuery: IPostPaganationQuery, blogId: string, request: Request) {
    const sortBy = postPagonationQuery.sortBy
      ? postPagonationQuery.sortBy
      : 'createdAt';
    const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 'asc' : 'desc';
    const sotringQuery = this.postsSortingQuery(sortBy);
    const pageNumber = postPagonationQuery.pageNumber
      ? +postPagonationQuery.pageNumber
      : 1;
    const pageSize = postPagonationQuery.pageSize
      ? +postPagonationQuery.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    let user: IUsersAcessToken;
    try {
      user = await this.jwtService.verifyAsync(
        request.headers.authorization.split(' ')[1],
      );
    }
    catch {
      user = { id: '0', email: '', login: '' }
    }

    const findedPosts = await this.dataSource.query(`
      SELECT posts.*, blogs.name AS "blogName",
      COALESCE((SELECT status from posts_likes WHERE "userId" = '${user.id}' AND "postId" = posts."id"), 'None') as status,
      COALESCE((
        SELECT json_agg(row) 
        FROM (
            SELECT "addedAt", "userId", "login"
            FROM posts_likes
            WHERE "postId" = posts."id" AND "status" = 'Like'
            ORDER BY "addedAt" desc
        ) row
      ),'[]') as likes_array,
      COALESCE((
          SELECT json_agg(row) 
          FROM (
              SELECT posts_likes.*
              FROM posts_likes
              WHERE "postId" = posts."id" AND "status" = 'Dislike'
          ) row
      ),'[]') as dislikes_array      
      FROM posts
      LEFT JOIN blogs
      ON posts."blogId" = blogs."id"
      WHERE posts."blogId" = '${blogId}'
      GROUP BY posts."id", blogs."name"
      ORDER BY "${sotringQuery}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${itemsToSkip}
    `)
    console.log(findedPosts)
    const postToReturn = findedPosts.map(p => {
      const post =
      {

        id: p.id.toString(),
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId.toString(),
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: p.likes_array.length,
          dislikesCount: p.dislikes_array.length,
          myStatus: p.status,
          newestLikes: p.likes_array.slice(0, 2).map(u => { return { ...u, userId: u.userId.toString() } })
        },
      }
      return post
    })

    const totalCountOfItems = (await this.dataSource.query(`SELECT * FROM posts WHERE "blogId" = '${blogId}'`)).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...postToReturn],
    };

    return mappedResponse;

  }

  async changePostLikeStatus(post, user: IUsersAcessToken, likeStatus: LikeStatus) {
    const currentLikeStatus = await this.getStatus(user.id, post.id);
    console.log(currentLikeStatus)
    switch (likeStatus) {
      case LikeStatus.LIKE:
        if (currentLikeStatus === LikeStatus.LIKE) {
          break;
        }
        await this.resetLikeStatus(post.id, user.id);
        await this.likePost(post.id, user);
        break;
      case LikeStatus.DISLIKE:
        if (currentLikeStatus === LikeStatus.DISLIKE) {
          break;
        }
        await this.resetLikeStatus(post.id, user.id);
        await this.dislikePost(post.id, user);
        break;
      case LikeStatus.NONE:
        await this.resetLikeStatus(post.id, user.id);
        break;
    }

  }

  private async resetLikeStatus(postId: string, userId: string) {
    await this.dataSource.query(`
      DELETE FROM posts_likes
      WHERE "postId" = '${postId}' AND "userId" = '${userId}'
    `)
  }

  private async likePost(postId: string, user: IUsersAcessToken) {
    await this.dataSource.query(`
      INSERT INTO posts_likes ("postId", "userId", "login", "status")
      VALUES ('${postId}', '${user.id}', '${user.login}', 'Like')
    `)
  }

  private async dislikePost(postId: string, user: IUsersAcessToken) {
    await this.dataSource.query(`
      INSERT INTO posts_likes ("postId", "userId", "login", "status")
      VALUES ('${postId}', '${user.id}', '${user.login}', 'Dislike')
    `)
  }



}
