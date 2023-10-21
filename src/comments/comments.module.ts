import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, commentsSchema } from '../entyties/comments.schema';
import { CommentsController } from './comments.controller';
import { CreateCommentToPostUseCase } from './use-cases/create-comment-to-post';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentRepository } from './comments.repository';
import { GetCommentByIdUseCase } from './use-cases/get-comment-by-id';
import { UpdateCommentByIdUseCase } from './use-cases/update-comment';
import { ChengeCommentLikeStatusUseCase } from './use-cases/change-comment-like-status';
import { DeleteCommandByIdUseCase } from './use-cases/delete-comment';
import { CommentRepositoryPg } from './comments.repository-pg';
import { GetAllPostsCommentsUseCase } from './use-cases/get-all-comments-in-post';

const useCases = [GetAllPostsCommentsUseCase, DeleteCommandByIdUseCase, ChengeCommentLikeStatusUseCase, CreateCommentToPostUseCase, GetCommentByIdUseCase, UpdateCommentByIdUseCase]

let imports = []
let exporters = []
let providers = []
if (process.env.DATABASE === 'mongo') {
  imports = [
    MongooseModule.forFeature([{ name: Comment.name, schema: commentsSchema }]),
  ]
  providers = [
    CommentRepository
  ]
} else if (process.env.DATABASE === 'postgres') {
  providers = [CommentRepositoryPg]
}

@Module({
  imports: [
    CqrsModule
  ],
  controllers: [CommentsController],
  providers: [...useCases, ...providers],
  exports: [...useCases]
})
export class CommentsModule { }
