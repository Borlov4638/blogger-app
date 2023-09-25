import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/post.dto";



@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostsService) {}

    @Get()
    getAllPosts(){

    }

    @Post()
    async createNewPost(@Body() data: CreatePostDto){
        return await this.postService.createNewPost(data)
    }
    
    @Put()
    updatePost(){
        
    }
}