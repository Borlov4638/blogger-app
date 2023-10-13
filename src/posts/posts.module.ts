import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, postSchema } from '../entyties/posts.schema';
import { PostController } from './posts.controller';
import { PostsService } from './posts.service';
import { Blog, BlogSchema } from '../entyties/blogs.schema';
import { PostRepository } from './posts.repository';
import { Comment, commentsSchema } from '../entyties/comments.schema';
import { CustomBlogIdValidation } from './dto/post.dto';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './use-cases/create-post';
import { GetPostByIdUseCase } from './use-cases/get-post-by-id';

const UseCases = [CreatePostUseCase, GetPostByIdUseCase];

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
    PostsService,
    PostRepository,
    CustomBlogIdValidation,
    ...UseCases,
  ],
  exports: [PostsService, PostRepository],
})
export class PostsModule {}
