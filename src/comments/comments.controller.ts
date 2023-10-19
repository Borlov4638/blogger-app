import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BearerAccessAuthGuard } from '../auth/guards/auth.bearer.guard';
import { PostCreateNewCommentDto } from '../posts/dto/post.dto';
import { CommentChangeLikeStatusDto } from './dto/comments.dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentByIdCommand } from './use-cases/get-comment-by-id';
import { UpdateCommentByIdCommand } from './use-cases/update-comment';
import { ChengeCommentLikeStatusCommand } from './use-cases/change-comment-like-status';
import { DeleteCommandByIdUseCase, DeleteCommentByIdCommand } from './use-cases/delete-comment';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus
  ) { }

  @Get(':id')
  async getCommentById(@Param('id') comentId: string, @Req() request: Request) {
    return await this.commandBus.execute(new GetCommentByIdCommand(comentId, request))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id')
  async updateComment(
    @Body() data: PostCreateNewCommentDto,
    @Param('id') commentId: string,
    @Req() request: Request,
  ) {
    return await this.commandBus.execute(new UpdateCommentByIdCommand(
      data.content,
      commentId,
      request,
    ))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id/like-status')
  async changeLikeStatus(
    @Param('id') id: string,
    @Body() body: CommentChangeLikeStatusDto,
    @Req() request: Request,
  ) {
    return await this.commandBus.execute(new ChengeCommentLikeStatusCommand(
      request,
      id,
      body.likeStatus,
    ))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Delete(':id')
  async deleteCommentById(
    @Param('id') commentId: string,
    @Req() request: Request,
  ) {
    await this.commandBus.execute(new DeleteCommentByIdCommand(commentId, request))
    return;
  }
}
