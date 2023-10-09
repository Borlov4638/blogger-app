import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../entyties/blogs.schema';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';
import { PostsModule } from '../posts/posts.module';
import { GetAllBlogsUseCase } from './use-cases/get-all-blogs-with-pagonation';
import { CreateBlogUseCase } from './use-cases/create-blog';
import { GetBlogByIdUseCase } from './use-cases/get-blog-by-id';
import { UpdateBlogByIdUseCase } from './use-cases/update-blog-by-id';
import { DeleteBlogByIdUseCase } from './use-cases/delete-blog-by-id';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllPostsInBlogUseCase } from 'src/posts/use-cases/get-posts-by-blog-id';
import { Post, postSchema } from 'src/entyties/posts.schema';
import { CreatePostUseCase } from 'src/posts/use-cases/create-post';

const useCases = [
  GetAllBlogsUseCase,
  CreateBlogUseCase,
  GetBlogByIdUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByIdUseCase,
  GetAllPostsInBlogUseCase,
  CreatePostUseCase
]


@Module({
  controllers: [BlogsController],
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }, { name: Post.name, schema: postSchema }]),
    PostsModule,
    CqrsModule
  ],
  providers: [BlogsService, BlogsRepository, ...useCases],
})
export class BlogsModule { }
