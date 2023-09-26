import { Controller, Get, Param } from "@nestjs/common";
import { CommentsService } from "./comments.service";

@Controller('comments')
export class CommentsController{
    constructor(private readonly commentsService : CommentsService) {}
    
    @Get(':id')
    async getCommentById(@Param('id') comId : string){
        return await this.commentsService.getCommentById(comId)
    }
}