import { Controller, Get, Post, Put } from "@nestjs/common";



@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostsService) {}

    @Get()
    getAllPosts(){

    }

    @Post()
    createNewPost(){

    }
    
    @Put()
    updatePost(){
        
    }
}