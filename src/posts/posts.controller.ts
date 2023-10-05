import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  PostLikeStatusDto,
  PostPaganationQuery,
  PostUpdateDto,
  PostsCommentsPaganation,
} from './dto/post.dto';
import { BasicAuthGuard } from '../auth/guards/auth.basic.guard';
import { Request } from 'express';
import { BearerAccessAuthGuard, BearerRefreshAuthGuard } from '../auth/guards/auth.bearer.guard';
import { SessionService } from '../auth/sessions.service';
import { LikeStatus } from '../enums/like-status.enum';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostsService, private readonly sessionService : SessionService) {}

  @Get()
  async getAllPosts(@Query() postPagonationQuery: PostPaganationQuery, @Req() request: Request) {
    return await this.postService.getAllPosts(postPagonationQuery, request);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Req() request : Request) {
    return await this.postService.getPostById(postId, request);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createNewPost(
    @Body() data: CreatePostDto,
    @Body('blogId') blogId: string,
  ) {
    return await this.postService.createNewPost(data, blogId);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(@Param('id') postId: string, @Body() data: PostUpdateDto) {
    return await this.postService.updatePost(postId, data);
  }
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePostById(@Param('id') postId: string) {
    return await this.postService.deletePostById(postId);
  }
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BearerAccessAuthGuard, BearerRefreshAuthGuard)
  @Post(":id/comments")
  async commentPostById(@Param('id') postId: string, @Req() request : Request, @Body('content') content:string){
    await this.sessionService.validateSession(request)
    return await this.postService.commentPostById(postId, request, content)
  }
  @Get(":id/comments")
  async getAllPostsComments(@Param('id') postId:string, @Query() postsCommentsPaganation : PostsCommentsPaganation, @Req() request: Request) {
    return await this.postService.getAllPostsComments(postId, postsCommentsPaganation, request)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id/like-status')
  async changeLikeStatus(@Param('id') postId:string, @Body() data:PostLikeStatusDto, @Req() request:Request){
    await this.sessionService.validateSession
    return  await this.postService.changeLikeStatus(postId, data.likeStatus, request)
  }
}
