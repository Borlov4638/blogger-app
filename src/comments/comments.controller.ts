import { Controller, Get } from "@nestjs/common";

@Controller('comments')
export class CommentsController{
    @Get()
    getPostsComments(){
        
    }
}