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
  BlogPaganationQuery,
  CreateBlogDto,
  CreatePostByBlogIdDto,
  UpdateBlogDto,
} from './dto/blogs.dto';
import { BlogsService } from './blogs.service';
import { PostsService } from '../posts/posts.service';
import { PostPaganationQuery } from '../posts/dto/post.dto';
import { BasicAuthGuard } from '../auth/guards/auth.basic.guard';
import { Request } from 'express';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postService: PostsService,
  ) {}

  @Get()
  getAllBlog(@Query() query: BlogPaganationQuery) {
    return this.blogsService.getAllBlogs(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return await this.blogsService.createNewBlog(createBlogDto);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogsService.getBlogById(id);
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return await this.blogsService.updateBlogById(id, updateBlogDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteBlogById(@Param('id') id: string) {
    return await this.blogsService.deleteBlogById(id);
  }

  @Get(':blogId/posts')
  getAllPostsInBlog(
    @Param('blogId') id: string,
    @Query() paganation: PostPaganationQuery,
    @Req() request: Request,
  ) {
    return this.postService.getAllPostsInBlog(paganation, id, request);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() data: CreatePostByBlogIdDto,
  ) {
    return await this.postService.createNewPost(data, blogId);
  }
}
