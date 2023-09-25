import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Post, PostSchema } from "src/entyties/posts.schema";
import { PostController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { Blog, BlogSchema } from "src/entyties/blogs.schema";
import { PostRepository } from "./posts.repository";


@Module({
    imports: [MongooseModule.forFeature([{name:Post.name, schema:PostSchema}, {name:Blog.name, schema: BlogSchema}])],
    controllers:[PostController],
    providers:[PostsService, PostRepository]
})
export class PostsModule {}