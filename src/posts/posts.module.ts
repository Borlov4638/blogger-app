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
import { GetAllPostsInBlogCommand } from './use-cases/get-posts-by-blog-id';
import { GetAllPostsUseCase } from './use-cases/get-all-posts';
import { UpdatePostUseCase } from './use-cases/update-post';
import { DeletePostByIdUseCase } from './use-cases/delete-post-by-id';

const UseCases = [CreatePostUseCase, GetPostByIdUseCase, GetAllPostsInBlogCommand, GetAllPostsUseCase, UpdatePostUseCase, DeletePostByIdUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: postSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: commentsSchema },
    ]),
    CqrsModule,
  ],
  controllers: [PostController],
  providers: [
    PostRepository,
    CustomBlogIdValidation,
    ...UseCases,
  ],
  exports: [PostRepository, ...UseCases],
})
export class PostsModule { }
