import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { SessionService } from '../auth/sessions.service';
import { BearerAccessAuthGuard } from '../auth/guards/auth.bearer.guard';
import { LikeStatus } from '../enums/like-status.enum';
import { PostCreateNewCommentDto } from 'src/posts/dto/post.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService, private sessionService : SessionService) {}

  @Get(':id')
  async getCommentById(@Param('id') comId: string, @Req() request: Request) {
    return await this.commentsService.getCommentById(comId, request);
  }

  @UseGuards(BearerAccessAuthGuard)
  @Put(':id')
  async updateComment(@Body() data: PostCreateNewCommentDto, @Param('id') postId : string, @Req() request: Request){
    // await this.sessionService.validateSession(request)
    return  await this.commentsService.updateComment(data.content, postId, request);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Put(':id/like-status')
  async changeLikeStatus(@Param('id') id: string, @Body('likeStatus') body : LikeStatus, @Req() request: Request){
    // await this.sessionService.validateSession(request)
    return await this.commentsService.changeLikeStatus(request, id, body)
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAccessAuthGuard)
  @Delete(':id')
  async deleteCommentById(@Param('id') commentId:string, @Req() request:Request){
    // await this.sessionService.validateSession(request)
    await this.commentsService.deleteCommentById(commentId, request)
    return 
  }
}
