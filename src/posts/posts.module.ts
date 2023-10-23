import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, postSchema } from '../entyties/posts.schema';
import { PostController } from './posts.controller';
import { Blog, BlogSchema } from '../entyties/blogs.schema';
import { PostRepository } from './posts.repository';
import { Comment, commentsSchema } from '../entyties/comments.schema';
import { CustomBlogIdValidation } from './dto/post.dto';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './use-cases/create-post';
import { GetPostByIdUseCase } from './use-cases/get-post-by-id';
import { GetAllPostsInBlogUseCase } from './use-cases/get-posts-by-blog-id';
import { GetAllPostsUseCase } from './use-cases/get-all-posts';
import { UpdatePostUseCase } from './use-cases/update-post';
import { DeletePostByIdUseCase } from './use-cases/delete-post-by-id';
import { PostRepositoryPg } from './posts.repository-pg';
import { BlogsModule } from 'src/blogs/blogs.module';
import { UpdatePostAssignedToBlogUseCase } from './use-cases/update-post-by-blog-id';
import { DeletePostInBlogsUseCase } from './use-cases/delete-post-by-blog-id';
import { ChangePostsLikeStatusUseCase } from './use-cases/change-post-like-status';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostPg } from './entitys/post.entity';
import { PostLikes } from './entitys/post-likes.entity';

const UseCases = [ChangePostsLikeStatusUseCase, DeletePostInBlogsUseCase, CreatePostUseCase, GetPostByIdUseCase, GetAllPostsInBlogUseCase, GetAllPostsUseCase, UpdatePostUseCase, DeletePostByIdUseCase, UpdatePostAssignedToBlogUseCase];
let imports = []
let providers = []
let exporters = []
if (process.env.DATABASE === 'mongo') {
  imports = [
    MongooseModule.forFeature([
      { name: Post.name, schema: postSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: commentsSchema },
    ]),
    BlogsModule
  ]
  providers = [PostRepository]
  exporters = [PostRepository]

} else if (process.env.DATABASE === 'postgres') {
  imports = [TypeOrmModule.forFeature([PostPg, PostLikes]), BlogsModule]
  providers = [PostRepositoryPg]
  exporters = [PostRepositoryPg]

}

@Module({
  imports: [
    ...imports,
    CqrsModule,
  ],
  controllers: [PostController],
  providers: [
    ...providers,
    CustomBlogIdValidation,
    ...UseCases,
  ],
  exports: [...exporters, ...UseCases],
})
export class PostsModule { }
