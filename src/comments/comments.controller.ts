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
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { BearerAccessAuthGuard } from '../auth/guards/auth.bearer.guard';
import { PostCreateNewCommentDto } from '../posts/dto/post.dto';
import { CommentChangeLikeStatusDto } from './dto/comments.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async getCommentById(@Param('id') comId: string, @Req() request: Request) {
    return await this.commentsService.getCommentById(comId, request);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id')
  async updateComment(
    @Body() data: PostCreateNewCommentDto,
    @Param('id') commentId: string,
    @Req() request: Request,
  ) {
    return await this.commentsService.updateComment(
      data.content,
      commentId,
      request,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id/like-status')
  async changeLikeStatus(
    @Param('id') id: string,
    @Body() body: CommentChangeLikeStatusDto,
    @Req() request: Request,
  ) {
    return await this.commentsService.changeLikeStatus(
      request,
      id,
      body.likeStatus,
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Delete(':id')
  async deleteCommentById(
    @Param('id') commentId: string,
    @Req() request: Request,
  ) {
    await this.commentsService.deleteCommentById(commentId, request);
    return;
  }
}
