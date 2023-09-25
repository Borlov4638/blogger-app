import { NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Blog } from "src/entyties/blogs.schema";
import { Post } from "src/entyties/posts.schema";

interface ICreatePost{
    title:string
    shortDescription:string
    content:string
    blogId:string | Types.ObjectId
}


export class PostsService {
    constructor(@InjectModel(Post.name) private postModel: Model<Post>, @InjectModel(Blog.name) private blogModel: Model<Blog>){}

    async createNewPost(data: ICreatePost){
        data.blogId = new Types.ObjectId(data.blogId)
        const blogToPost = await this.blogModel.findById(data.blogId).exec()
        console.log(blogToPost)
        if(!blogToPost){
            throw new NotFoundException()            
        }
        const newPost = new this.postModel(data)
        return await newPost.save()
    }
}