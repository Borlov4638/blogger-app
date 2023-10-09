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
import { PostPaganationQuery } from '../posts/dto/post.dto';
import { BasicAuthGuard } from '../auth/guards/auth.basic.guard';
import { Request } from 'express';
import { GetAllBlogsCommand } from './use-cases/get-all-blogs-with-pagonation';
import { CreateBlogCommand } from './use-cases/create-blog';
import { GetBlogByIdCommand } from './use-cases/get-blog-by-id';
import { UpdateBlogByIdCommand } from './use-cases/update-blog-by-id';
import { DeleteBlogByIdCommand } from './use-cases/delete-blog-by-id';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllPostsInBlogCommand } from '../posts/use-cases/get-posts-by-blog-id';
import { CreatePostCommand } from '../posts/use-cases/create-post';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
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
    return this.commandBus.execute(new GetAllPostsInBlogCommand(paganation, id, request))
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() data: CreatePostByBlogIdDto,
  ) {
    return await this.commandBus.execute(new CreatePostCommand(data, blogId));
  }
}
