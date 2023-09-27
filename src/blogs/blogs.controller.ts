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
} from '@nestjs/common';
import { BlogPaganationQuery, CreateBlogDto, UpdateBlogDto } from './dto/blogs.dto';
import { BlogsService } from './blogs.service';
import { PostsService } from '../posts/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService, private readonly postService: PostsService) {}

  @Get()
  getAllBlog(@Query() query: BlogPaganationQuery) {
    return this.blogsService.getAllBlogs(query);
  }

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return await this.blogsService.createNewBlog(createBlogDto);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogsService.getBlogById(id)

  }

  @HttpCode(204)
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return await this.blogsService.updateBlogById(id, updateBlogDto)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlogById(@Param('id') id: string) {
    return await this.blogsService.deleteBlogById(id)
  }

  @Get(':blogId/posts')
  getPostsByBlogId(@Param('blogsId') id: string) {}

  @Post(':blogId/posts')
  async createPostByBlogId(@Param('blogId') blogId: string, @Body('title') title: string, @Body('shortDescription') shortDescription: string, @Body('content') content:string) {
    return await this.postService.createNewPost({title, shortDescription, content}, blogId)
  }
}
