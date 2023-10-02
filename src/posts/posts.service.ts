import { NotFoundException, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from '../entyties/blogs.schema';
import { Post, PostDocument } from '../entyties/posts.schema';
import { PostRepository } from './posts.repository';
import { Comment, CommentDocument } from 'src/entyties/comments.schema';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LikeStatus } from 'src/enums/like-status.enum';
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

interface IUsersAcessToken{
  id:string
  email:string
  login:string
}


export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly postRepo: PostRepository,
    private readonly jwtService : JwtService
  ) {}

  async getAllPosts(postPagonationQuery: IPostPaganationQuery) {
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
      .find({}, { _id: false, __v: false, likesInfo: false })
      .sort(sotringQuery)
      .skip(itemsToSkip)
      .limit(pageSize);

    const totalCountOfItems = (await this.postModel.find({})).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...findedPosts],
    };

    return mappedResponse;
  }

  async getPostById(postId: string) {
    const findedPost = await this.postModel
      .findById(
        new Types.ObjectId(postId),
        { _id: false, __v: false, likesInfo: false },
        { sort: { _id: -1 } },
      )
      .exec();
    if (!findedPost) {
      throw new NotFoundException('no such post');
    }
    return findedPost;
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
      .find({ blogId }, { _id: false, __v: false, likesInfo: false })
      .sort(sotringQuery)
      .skip(itemsToSkip)
      .limit(pageSize);

    const totalCountOfItems = (await this.postModel.find({ blogId })).length;

    const mappedResponse = {
      pagesCount: Math.ceil(totalCountOfItems / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountOfItems,
      items: [...findedPosts],
    };

    return mappedResponse;
  }
  async commentPostById(postId : string, request : Request, content: string){
    const postToComment = await this.getPostById(postId)
    const token = request.headers.authorization.split(' ')[1]
    const tokenData : IUsersAcessToken = await this.jwtService.verifyAsync(token)
    const commentatorInfo = {
      userId: tokenData.id,
      userLogin: tokenData.login
    }
    const comment = new this.commentModel({commentatorInfo, content, postId})
    return await comment.save().then(comment =>{
      const plainComment : CommentDocument = comment.toObject()
      delete plainComment._id
      delete plainComment.__v
      delete plainComment.likesInfo
      return {...plainComment, likesInfo:{
        likesCount:0,
        dislikesCount:0,
        myStatus:LikeStatus.NONE
      }}
    })
  }
  async getAllPostsComments(postId : string, postsCommentsPaganation: PostsCommentsPaganation, request:Request){
    await this.getPostById(postId)

    const sortBy = (postsCommentsPaganation.sortBy) ? postsCommentsPaganation.sortBy : "createdAt"
    const sortDirection = (postsCommentsPaganation.sortDirection === "asc") ? 1 : -1
    const sotringQuery = this.postRepo.commentsSortingQuery(sortBy, sortDirection)
    const pageNumber = (postsCommentsPaganation.pageNumber) ? +postsCommentsPaganation.pageNumber : 1
    const pageSize = (postsCommentsPaganation.pageSize) ? +postsCommentsPaganation.pageSize : 10
    const itemsToSkip = (pageNumber - 1) * pageSize
    
    const selectedComments = await this.commentModel.find({postId:postId},{_id:false, postId:false, __v:false})
      .sort(sotringQuery)
      .skip(itemsToSkip)
      .limit(pageSize)
      .lean()
    let token :string
    if(request.headers.authorization){
      token = request.headers.authorization.split(' ')[1]
    }
    const commentsToSend = selectedComments.map(comm => {
      let myStatus = LikeStatus.NONE
      if(token){
          const user : IUsersAcessToken = this.jwtService.verify(token)
          if(user){
              myStatus = comm.getLikeStatus(user.id)
          }
      }
      const likesCount = comm.likesInfo.usersWhoLiked.length
      const dislikesCount = comm.likesInfo.usersWhoDisliked.length
      return {...comm, likesInfo:{likesCount, dislikesCount, myStatus}}
    })
    const totalCountOfItems = (await this.commentModel.find({postId})).length
    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems,
        items: [...commentsToSend]
    }
    return mappedResponse
  }

}
