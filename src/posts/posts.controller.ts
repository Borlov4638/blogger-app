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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  PostPaganationQuery,
  PostUpdateDto,
} from './dto/post.dto';
import { BasicAuthGuard } from 'src/auth/guards/auth.basic.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  async getAllPosts(@Query() postPagonationQuery: PostPaganationQuery) {
    return await this.postService.getAllPosts(postPagonationQuery);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string) {
    return await this.postService.getPostById(postId);
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

  @Get()
  getAllPostsComments() {}
}
