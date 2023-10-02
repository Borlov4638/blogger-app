import { Controller, Get, Param, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async getCommentById(@Param('id') comId: string, @Req() request: Request) {
    return await this.commentsService.getCommentById(comId, request);
  }
}
