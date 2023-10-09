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
import { GetAllBlogsCommand, GetAllBlogsUseCase } from './use-cases/get-all-blogs-with-pagonation';
import { CreateBlogCommand, CreateBlogUseCase } from './use-cases/create-blog';
import { GetBlogByIdCommand, GetBlogByIdUseCase } from './use-cases/get-blog-by-id';
import { UpdateBlogByIdCommand, UpdateBlogByIdUseCase } from './use-cases/update-blog-by-id';
import { DeleteBlogByIdCommand, DeleteBlogByIdUseCase } from './use-cases/delete-blog-by-id';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postService: PostsService,
  ) { }

  @Get()
  async getAllBlog(@Query() query: BlogPaganationQuery) {
    return await this.commandBus.execute(new GetAllBlogsCommand(query))
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() data: CreateBlogDto) {
    return await this.commandBus.execute(new CreateBlogCommand(data));
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.commandBus.execute(new GetBlogByIdCommand(id));
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() data: UpdateBlogDto,
  ) {
    return await this.commandBus.execute(new UpdateBlogByIdCommand(id, data))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteBlogById(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteBlogByIdCommand(id));
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
