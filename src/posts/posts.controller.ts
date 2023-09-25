import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto, PostPaganationQuery, PostUpdateDto } from "./dto/post.dto";



@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostsService) {}

    @Get()
    async getAllPosts(@Query() postPagonationQuery : PostPaganationQuery){
        return await this.postService.getAllPosts(postPagonationQuery)
    }

    @Get(':id')
    async getPostById(@Param('id') postId:string){
        return await this.postService.getPostById(postId)
    }
    
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async createNewPost(@Body() data: CreatePostDto){
        return await this.postService.createNewPost(data)
    }
    
    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':id')
    async updatePost(@Param('id') postId: string, @Body() data: PostUpdateDto){
        return await this.postService.updatePost(postId ,data)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deletePostById(@Param('id') postId:string){
        return await this.postService.deletePostById(postId)
    }

    @Delete()
    async deleteAllPosts(){
        await this.postService.deleteAll()
    }
}