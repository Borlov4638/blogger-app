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
  PostCreateNewCommentDto,
  PostLikeStatusDto,
  PostPaganationQuery,
  PostUpdateDto,
  PostsCommentsPaganation,
} from './dto/post.dto';
import { BasicAuthGuard } from '../auth/guards/auth.basic.guard';
import { Request } from 'express';
import { BearerAccessAuthGuard } from '../auth/guards/auth.bearer.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from './use-cases/create-post';
import { GetPostByIdCommand } from './use-cases/get-post-by-id';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostsService,
    private commandBus: CommandBus
  ) { }

  @Get()
  async getAllPosts(
    @Query() postPagonationQuery: PostPaganationQuery,
    @Req() request: Request,
  ) {
    return await this.postService.getAllPosts(postPagonationQuery, request);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Req() request: Request) {
    return await this.commandBus.execute(new GetPostByIdCommand(postId, request));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createNewPost(
    @Body() data: CreatePostDto,
    @Body('blogId') blogId: string,
  ) {
    return await this.commandBus.execute(new CreatePostCommand(data, blogId));
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
  @UseGuards(BearerAccessAuthGuard)
  @Post(':id/comments')
  async commentPostById(
    @Param('id') postId: string,
    @Req() request: Request,
    @Body() data: PostCreateNewCommentDto,
  ) {
    // await this.sessionService.validateSession(request)
    return await this.postService.commentPostById(
      postId,
      request,
      data.content,
    );
  }
  @Get(':id/comments')
  async getAllPostsComments(
    @Param('id') postId: string,
    @Query() postsCommentsPaganation: PostsCommentsPaganation,
    @Req() request: Request,
  ) {
    return await this.postService.getAllPostsComments(
      postId,
      postsCommentsPaganation,
      request,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id/like-status')
  async changeLikeStatus(
    @Param('id') postId: string,
    @Body() data: PostLikeStatusDto,
    @Req() request: Request,
  ) {
    // await this.sessionService.validateSession(request)
    return await this.postService.changeLikeStatus(
      postId,
      data.likeStatus,
      request,
    );
  }
}
