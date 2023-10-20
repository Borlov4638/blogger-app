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
import { GetAllPostsCommand } from './use-cases/get-all-posts';
import { UpdatePostCommand } from './use-cases/update-post';
import { DeletePostByIdCommand } from './use-cases/delete-post-by-id';
import { CreateCommentToPostCommand } from 'src/comments/use-cases/create-comment-to-post';

@Controller('posts')
export class PostController {
  constructor(
    private commandBus: CommandBus,
  ) { }

  @Get()
  async getAllPosts(
    @Query() postPagonationQuery: PostPaganationQuery,
    @Req() request: Request,
  ) {
    return await this.commandBus.execute(new GetAllPostsCommand(postPagonationQuery, request));
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Req() request: Request) {
    return await this.commandBus.execute(
      new GetPostByIdCommand(postId, request),
    );
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
    return await this.commandBus.execute(new UpdatePostCommand(postId, data));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePostById(@Param('id') postId: string) {
    return await this.commandBus.execute(new DeletePostByIdCommand(postId));
  }
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BearerAccessAuthGuard)
  @Post(':id/comments')
  async commentPostById(
    @Param('id') postId: string,
    @Req() request: Request,
    @Body() data: PostCreateNewCommentDto,
  ) {
    return await this.commandBus.execute(new CreateCommentToPostCommand(
      postId,
      request,
      data.content,
    ))
  }
  @Get(':id/comments')
  async getAllPostsComments(
    @Param('id') postId: string,
    @Query() postsCommentsPaganation: PostsCommentsPaganation,
    @Req() request: Request,
  ) {
    // return await this.postService.getAllPostsComments(
    //   postId,
    //   postsCommentsPaganation,
    //   request,
    // );
    return
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id/like-status')
  async changeLikeStatus(
    @Param('id') postId: string,
    @Body() data: PostLikeStatusDto,
    @Req() request: Request,
  ) {
    // return await this.postService.changeLikeStatus(
    //   postId,
    //   data.likeStatus,
    //   request,
    // );
    return
  }
}
