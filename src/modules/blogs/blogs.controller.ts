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
import {
  PostPaganationQuery,
  PostUpdateByBlogDto,
} from '../posts/dto/post.dto';
import { BasicAuthGuard } from '../../auth/guards/auth.basic.guard';
import { Request } from 'express';
import { GetAllBlogsCommand } from './use-cases/get-all-blogs-with-pagonation';
import { CreateBlogCommand } from './use-cases/create-blog';
import { GetBlogByIdCommand } from './use-cases/get-blog-by-id';
import { UpdateBlogByIdCommand } from './use-cases/update-blog-by-id';
import { DeleteBlogByIdCommand } from './use-cases/delete-blog-by-id';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllPostsInBlogCommand } from '../posts/use-cases/get-posts-by-blog-id';
import { CreatePostCommand } from '../posts/use-cases/create-post';
import { UpdatePostAssignedToBlogCommand } from 'src/modules/posts/use-cases/update-post-by-blog-id';
import { DeletePostInBlogCommand } from 'src/modules/posts/use-cases/delete-post-by-blog-id';

@Controller()
export class BlogsController {
  constructor(private commandBus: CommandBus) { }

  @UseGuards(BasicAuthGuard)
  @Get('sa/blogs')
  async getAllBlogsSa(@Query() query: BlogPaganationQuery) {
    return await this.commandBus.execute(new GetAllBlogsCommand(query));
  }

  @Get('blogs')
  async getAllBlogsPublic(@Query() query: BlogPaganationQuery) {
    return await this.commandBus.execute(new GetAllBlogsCommand(query));
  }

  @UseGuards(BasicAuthGuard)
  @Post('sa/blogs')
  async createBlog(@Body() data: CreateBlogDto) {
    return await this.commandBus.execute(new CreateBlogCommand(data));
  }

  @Get('blogs/:id')
  async getBlogByIdPublic(@Param('id') id: string) {
    return await this.commandBus.execute(new GetBlogByIdCommand(id));
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put('sa/blogs/:id')
  async updateBlog(@Param('id') id: string, @Body() data: UpdateBlogDto) {
    return await this.commandBus.execute(new UpdateBlogByIdCommand(id, data));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete('sa/blogs/:id')
  async deleteBlogById(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteBlogByIdCommand(id));
  }

  @UseGuards(BasicAuthGuard)
  @Get('sa/blogs/:blogId/posts')
  async getAllPostsInBlogSa(
    @Param('blogId') id: string,
    @Query() paganation: PostPaganationQuery,
    @Req() request: Request,
  ) {
    return await this.commandBus.execute(
      new GetAllPostsInBlogCommand(paganation, id, request),
    );
  }

  @Get('blogs/:blogId/posts')
  async getAllPostsInBlogPublic(
    @Param('blogId') id: string,
    @Query() paganation: PostPaganationQuery,
    @Req() request: Request,
  ) {
    return await this.commandBus.execute(
      new GetAllPostsInBlogCommand(paganation, id, request),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post('sa/blogs/:blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() data: CreatePostByBlogIdDto,
  ) {
    return await this.commandBus.execute(new CreatePostCommand(data, blogId));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put('sa/blogs/:blogId/posts/:postId')
  async updatePostAssignedToBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() data: PostUpdateByBlogDto,
    @Req() request: Request,
  ) {
    data.blogId = blogId;
    return await this.commandBus.execute(
      new UpdatePostAssignedToBlogCommand(postId, blogId, request, data),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete('sa/blogs/:blogId/posts/:postId')
  async deletePostAssignedToBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    return await this.commandBus.execute(
      new DeletePostInBlogCommand(blogId, postId),
    );
  }
}
