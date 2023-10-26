import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../entyties/blogs.schema';
import { BlogsRepository } from './blogs.repository';
import { PostsModule } from '../posts/posts.module';
import { GetAllBlogsUseCase } from './use-cases/get-all-blogs-with-pagonation';
import { CreateBlogUseCase } from './use-cases/create-blog';
import { GetBlogByIdUseCase } from './use-cases/get-blog-by-id';
import { UpdateBlogByIdUseCase } from './use-cases/update-blog-by-id';
import { DeleteBlogByIdUseCase } from './use-cases/delete-blog-by-id';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllPostsInBlogUseCase } from '../posts/use-cases/get-posts-by-blog-id';
import { Post, postSchema } from '../entyties/posts.schema';
import { CreatePostUseCase } from '../posts/use-cases/create-post';
import { BlogsRepositoryPg } from './blogs.repository-pg';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entitys/blogs.entity';

const useCases = [
  GetAllBlogsUseCase,
  CreateBlogUseCase,
  GetBlogByIdUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByIdUseCase,
  // GetAllPostsInBlogUseCase,
  // CreatePostUseCase,
];
let imports = []
let providers = []
let exporters = []
if (process.env.DATABASE === 'mongo') {
  imports = [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: postSchema },
    ]),
  ]
  exporters = [BlogsRepository]
  providers = [BlogsRepository]
} else if (process.env.DATABASE === 'postgres') {
  imports = [TypeOrmModule.forFeature([BlogEntity])];
  providers = [BlogsRepositoryPg]
  exporters = [BlogsRepositoryPg]
}

@Module({
  controllers: [BlogsController],
  imports: [
    ...imports,
    //PostsModule,
    CqrsModule,
  ],
  providers: [...providers, ...useCases],
  exports: [...exporters]
})
export class BlogsModule { }
