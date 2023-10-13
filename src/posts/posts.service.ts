import {
  NotFoundException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from '../entyties/blogs.schema';
import { Post, PostDocument } from '../entyties/posts.schema';
import { PostRepository } from './posts.repository';
import { Comment, CommentDocument } from '../entyties/comments.schema';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LikeStatus } from '../enums/like-status.enum';
import { PostsCommentsPaganation } from './dto/post.dto';

interface ICreatePost {
  title: string;
  shortDescription: string;
  content: string;
}

interface IPostPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

interface IPostUpdate {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string | Types.ObjectId;
}

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly postRepo: PostRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getAllPosts(
    postPagonationQuery: IPostPaganationQuery,
    request: Request,
  ) {
    const sortBy = postPagonationQuery.sortBy
      ? postPagonationQuery.sortBy
      : 'createdAt';
    const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.postRepo.postsSortingQuery(sortBy, sortDirection);
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

  async getPostById(postId: string, request: Request) {
    const findedPost = await this.postModel.findById(
      new Types.ObjectId(postId),
      { _id: false, __v: false },
    );

    if (!findedPost) {
      throw new NotFoundException('no such post');
    }
    const token = request.headers.authorization;
    let myStatus = LikeStatus.NONE;
    let user: IUsersAcessToken;
    if (token) {
      try {
        const decodedToken = request.headers.authorization.split(' ')[1];
        user = await this.jwtService.verifyAsync(decodedToken);
      } catch {
        user = null;
      }
      if (user) {
        myStatus = findedPost.getStatus(user.id);
      }
    }
    const newestLikes = findedPost.likesInfo.usersWhoLiked
      //@ts-ignore
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, 3);

    const extendedLikesInfo = {
      likesCount: findedPost.likesInfo.usersWhoLiked.length,
      dislikesCount: findedPost.likesInfo.usersWhoDisliked.length,
      myStatus,
      newestLikes: newestLikes.map((usr) => {
        return {
          userId: usr.userId,
          login: usr.login,
          addedAt: new Date(usr.addedAt).toISOString(),
        };
      }),
    };
    const postToReturn = { ...findedPost.toObject() };
    delete postToReturn.likesInfo;
    return { ...postToReturn, extendedLikesInfo };
  }

  async createNewPost(data: ICreatePost, blogId: string) {
    const blogToPost = await this.blogModel
      .findById(new Types.ObjectId(blogId))
      .exec();
    if (!blogToPost) {
      throw new NotFoundException();
    }
    const newPost = new this.postModel({
      ...data,
      blogId,
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

  async updatePost(postId: string, data: IPostUpdate) {
    data.blogId = new Types.ObjectId(data.blogId);

    const postToUpdate = await this.postModel.findById(
      new Types.ObjectId(postId),
    );
    if (!postToUpdate) {
      throw new NotFoundException('Post does not exists');
    }

    const blogToAssign = await this.blogModel.findById(data.blogId);
    if (!blogToAssign) {
      throw new NotFoundException('Blog does not exists');
    }
    postToUpdate.title = data.title;
    postToUpdate.shortDescription = data.shortDescription;
    postToUpdate.content = data.content;
    postToUpdate.blogId = data.blogId;

    await postToUpdate.save();
    return;
  }

  async deletePostById(id: string) {
    const postToDelete = await this.postModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
    if (!postToDelete) {
      throw new NotFoundException('no such post');
    }
    return;
  }

  async getAllPostsInBlog(
    postPagonationQuery: IPostPaganationQuery,
    blogId: string,
    request: Request,
  ) {
    const blogToFindPosts = await this.blogModel.findById(
      new Types.ObjectId(blogId),
    );
    if (!blogToFindPosts) {
      throw new NotFoundException();
    }

    const sortBy = postPagonationQuery.sortBy
      ? postPagonationQuery.sortBy
      : 'createdAt';
    const sortDirection = postPagonationQuery.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.postRepo.postsSortingQuery(sortBy, sortDirection);
    const pageNumber = postPagonationQuery.pageNumber
      ? +postPagonationQuery.pageNumber
      : 1;
    const pageSize = postPagonationQuery.pageSize
      ? +postPagonationQuery.pageSize
      : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;

    const findedPosts = await this.postModel
      .find({ blogId }, { _id: false, __v: false })
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
      let newestLikes;
      console.log(post);
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
      console.log(postToReturn);
      return { ...postToReturn, extendedLikesInfo };
    });

    const totalCountOfItems = (await this.postModel.find({ blogId })).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...postsToShow],
    };

    return mappedResponse;
  }
  async commentPostById(postId: string, request: Request, content: string) {
    const postToComment = await this.postModel
      .findById(new Types.ObjectId(postId), { _id: false, __v: false })
      .exec();
    if (!postToComment) {
      throw new NotFoundException('no such post');
    }

    const token = request.headers.authorization.split(' ')[1];
    const tokenData: IUsersAcessToken = await this.jwtService.verifyAsync(
      token,
    );
    const commentatorInfo = {
      userId: tokenData.id,
      userLogin: tokenData.login,
    };
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
  async getAllPostsComments(
    postId: string,
    postsCommentsPaganation: PostsCommentsPaganation,
    request: Request,
  ) {
    const postToComment = await this.postModel
      .findById(new Types.ObjectId(postId), { _id: false, __v: false })
      .exec();
    if (!postToComment) {
      throw new NotFoundException('no such post');
    }

    const sortBy = postsCommentsPaganation.sortBy
      ? postsCommentsPaganation.sortBy
      : 'createdAt';
    const sortDirection =
      postsCommentsPaganation.sortDirection === 'asc' ? 1 : -1;
    const sotringQuery = this.postRepo.commentsSortingQuery(
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
  async changeLikeStatus(
    postId: string,
    likeStatus: LikeStatus,
    request: Request,
  ) {
    const post = await this.postModel.findById(new Types.ObjectId(postId));
    if (!post) {
      throw new NotFoundException();
    }
    const user: IUsersAcessToken = await this.jwtService.verifyAsync(
      request.headers.authorization.split(' ')[1],
    );
    console.log({ user: user.login, status: likeStatus });
    const currentLikeStatus = post.getStatus(user.id);
    switch (likeStatus) {
      case LikeStatus.LIKE:
        if (currentLikeStatus === LikeStatus.LIKE) {
          break;
        }
        post.like(user.login, user.id);
        await post.save();
        break;
      case LikeStatus.DISLIKE:
        if (currentLikeStatus === LikeStatus.DISLIKE) {
          break;
        }
        post.dislike(user.id);
        await post.save();
        break;
      case LikeStatus.NONE:
        post.resetLikeStatus(user.id);
        await post.save();
        break;
    }
    return;
  }
}
