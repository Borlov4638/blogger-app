import { NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { Post, PostDocument } from "src/entyties/posts.schema";
import { LikeStatus } from "src/enums/like-status.enum";

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


export class PostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>,
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
    const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.postsSortingQuery(sortBy, sortDirection);
    const pageNumber = postPagonationQuery.pageNumber
      ? +postPagonationQuery.pageNumber
      : 1;
    const pageSize = postPagonationQuery.pageSize
      ? +postPagonationQuery.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;

    const findedPosts = await this.postModel
      .find({}, { _id: false, __v: false })
      .sort(sotringQuery)
      .skip(itemsToSkip)
      .limit(pageSize);

    const token = request.headers.authorization;

    let myStatus: string = LikeStatus.NONE;
    let user: IUsersAcessToken;
    const postsToShow = findedPosts.map((post) => {
      if (token) {
        try {
          user = this.jwtService.verify(
            request.headers.authorization.split(' ')[1],
          );
        } catch {
          user = null;
        }
        if (user) {
          console.log(post);
          myStatus = post.getStatus(user.id);
        }
      }
      const newestLikes = post.likesInfo.usersWhoLiked
        //@ts-ignore
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(0, 3);

      const extendedLikesInfo = {
        likesCount: post.likesInfo.usersWhoLiked.length,
        dislikesCount: post.likesInfo.usersWhoDisliked.length,
        myStatus,
        newestLikes: newestLikes.map((usr) => {
          return {
            userId: usr.userId,
            login: usr.login,
            addedAt: new Date(usr.addedAt).toISOString(),
          };
        }),
      };
      const postToReturn = { ...post.toObject() };
      delete postToReturn.likesInfo;
      console.log(extendedLikesInfo);
      return { ...postToReturn, extendedLikesInfo };
    });

    const totalCountOfItems = (await this.postModel.find({})).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...postsToShow],
    };

    return mappedResponse;
  }

  async createPost(blogToPost, data) {
    const newPost = new this.postModel({
      ...data,
      blogId: blogToPost.id,
      blogName: blogToPost.name,
    });
    return await newPost.save().then((newPost) => {
      const plainPost: PostDocument = newPost.toObject();
      delete plainPost.__v;
      delete plainPost._id;
      delete plainPost.likesInfo;
      return plainPost;
    });
  }

  async findPostById(postId: string) {

    return await this.postModel.findById(
      new Types.ObjectId(postId),
      { __v: false, _id: false },
    );


  }

  async updatePost(postId, data) {
    data.blogId = new Types.ObjectId(data.blogId);

    const postToUpdate = await this.postModel.findById(
      new Types.ObjectId(postId),
    );
    if (!postToUpdate) {
      throw new NotFoundException('Post does not exists');
    }

    postToUpdate.title = data.title;
    postToUpdate.shortDescription = data.shortDescription;
    postToUpdate.content = data.content;
    postToUpdate.blogId = data.blogId;

    await postToUpdate.save();
    return;
  }

  async deletePostById(id: string) {
    return await this.postModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }

  async getAllPostsInBlog(postPagonationQuery: IPostPaganationQuery, blogId: string, request: Request) {
    const sortBy = postPagonationQuery.sortBy
      ? postPagonationQuery.sortBy
      : 'createdAt';
    const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.postsSortingQuery(sortBy, sortDirection);
    const pageNumber = postPagonationQuery.pageNumber
      ? +postPagonationQuery.pageNumber
      : 1;
    const pageSize = postPagonationQuery.pageSize
      ? +postPagonationQuery.pageSize
      : 10;

    const itemsToSkip = (pageNumber - 1) * pageSize;

    const findedPosts =
      await this.postModel
        .find({ blogId: blogId }, { _id: false, __v: false })
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize);


    let token: string;
    try {
      token = request.headers.authorization.split(' ')[1];
    } catch {
      token = null;
    }
    let myStatus: string = LikeStatus.NONE;
    let user: IUsersAcessToken;
    const postsToShow = findedPosts.map((post) => {
      if (token) {
        try {
          user = this.jwtService.verify(token);
        } catch {
          user = null;
        }
        if (user) {
          myStatus = post.getStatus(user.id);
        }
      }
      let newestLikes;
      try {
        newestLikes = post.likesInfo.usersWhoLiked
          //@ts-ignore
          .sort((a, b) => b.addedAt - a.addedAt)
          .slice(0, 3);
      } catch {
        newestLikes = [];
      }
      const extendedLikesInfo = {
        likesCount: post.likesInfo.usersWhoLiked.length,
        dislikesCount: post.likesInfo.usersWhoDisliked.length,
        myStatus,
        newestLikes: newestLikes.map((usr) => {
          return {
            userId: usr.userId,
            login: usr.login,
            addedAt: new Date(usr.addedAt).toISOString(),
          };
        }),
      };
      const postToReturn = { ...post.toObject() };
      delete postToReturn.likesInfo;
      return { ...postToReturn, extendedLikesInfo };
    });

    const totalCountOfItems = (
      await this.postModel.find({ blogId: blogId })
    ).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...postsToShow],
    };

    return mappedResponse;

  }

}
