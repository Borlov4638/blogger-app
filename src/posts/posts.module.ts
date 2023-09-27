import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Post, postSchema } from "../entyties/posts.schema";
import { PostController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { Blog, BlogSchema } from "../entyties/blogs.schema";
import { PostRepository } from "./posts.repository";
import { Comment, commentsSchema } from "../entyties/comments.schema";


@Module({
    imports: [MongooseModule.forFeature([{name:Post.name, schema:postSchema}, {name:Blog.name, schema: BlogSchema}, {name:Comment.name, schema:commentsSchema}])],
    controllers:[PostController],
    providers:[PostsService, PostRepository],
    exports: [PostsService]
})
export class PostsModule {}