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
import { SessionService } from '../auth/sessions.service';
import { BearerAccessAuthGuard } from '../auth/guards/auth.bearer.guard';
import { LikeStatus } from '../enums/like-status.enum';
import { PostCreateNewCommentDto } from 'src/posts/dto/post.dto';
import { CommentChangeLikeStatusDto } from './dto/comments.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private sessionService: SessionService,
  ) {}

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
    // await this.sessionService.validateSession(request)
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
    // await this.sessionService.validateSession(request)  @UseGuards(BearerAccessAuthGuard)

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
    // await this.sessionService.validateSession(request)
    await this.commentsService.deleteCommentById(commentId, request);
    return;
  }
}
