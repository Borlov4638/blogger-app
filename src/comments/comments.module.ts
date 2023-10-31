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
import { CommentRepositoryPg } from './comments.repository-orm';
import { GetAllPostsCommentsUseCase } from './use-cases/get-all-comments-in-post';
import { CommentEntity } from './entitys/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentLikesEntity } from './entitys/comments-likes.entity';

const useCases = [
  GetAllPostsCommentsUseCase,
  DeleteCommandByIdUseCase,
  ChengeCommentLikeStatusUseCase,
  CreateCommentToPostUseCase,
  GetCommentByIdUseCase,
  UpdateCommentByIdUseCase,
];

let imports = [];
const exporters = [];
let providers = [];
if (process.env.DATABASE === 'mongo') {
  imports = [
    MongooseModule.forFeature([{ name: Comment.name, schema: commentsSchema }]),
  ];
  providers = [CommentRepository];
} else if (process.env.DATABASE === 'postgres') {
  imports = [TypeOrmModule.forFeature([CommentEntity, CommentLikesEntity])];
  providers = [CommentRepositoryPg];
}

@Module({
  imports: [CqrsModule, ...imports],
  controllers: [CommentsController],
  providers: [...useCases, ...providers],
  exports: [...useCases],
})
export class CommentsModule { }
