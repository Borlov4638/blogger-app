import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto, PostPaganationQuery, PostUpdateDto } from "./dto/post.dto";



@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostsService) {}

    @Get()
    async getAllPosts(@Query() postPagonationQuery : PostPaganationQuery){
        return await this.postService.getAllPosts(postPagonationQuery)
    }

    @Post()
    async createNewPost(@Body() data: CreatePostDto){
        return await this.postService.createNewPost(data)
    }
    
    @Put(':id')
    async updatePost(@Param('id') postId: string, @Body() data: PostUpdateDto){
        return await this.postService.updatePost(postId ,data)
    }
}