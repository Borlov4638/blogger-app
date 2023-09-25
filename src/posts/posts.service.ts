import { NotFoundException, Query } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Blog } from "src/entyties/blogs.schema";
import { Post } from "src/entyties/posts.schema";
import { PostRepository } from "./posts.repository";

interface ICreatePost{
    title:string
    shortDescription:string
    content:string
    blogId:string | Types.ObjectId
}

interface IPostPaganationQuery{
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
}

interface IPostUpdate {
    title:string
    shortDescription:string
    content:string
    blogId:string | Types.ObjectId
}


export class PostsService {
    constructor(@InjectModel(Post.name) private postModel: Model<Post>, @InjectModel(Blog.name) private blogModel: Model<Blog>, private readonly postRepo : PostRepository){}

    getAllPosts(postPagonationQuery: IPostPaganationQuery){
        const sortBy = postPagonationQuery.sortBy ? postPagonationQuery.sortBy : "createdAt"
        const sortDirection = (postPagonationQuery.sortDirection === "asc") ? 1 : -1
        const sotringQuery = this.postRepo.postsSortingQuery(sortBy, sortDirection)
        const pageNumber = postPagonationQuery.pageNumber ? +postPagonationQuery.pageNumber : 1
        const pageSize = postPagonationQuery.pageSize ? +postPagonationQuery.pageSize : 10
        const itemsToSkip = (pageNumber - 1) * pageSize
    
        return this.postModel.find({},{projection:{_id:0}})
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
    }

    async getPostById(postId:string){
        const findedPost = await this.postModel.findById(new Types.ObjectId(postId)).exec()
        if(!findedPost){
            throw new NotFoundException('no such post')
        }
        return findedPost
    }

    async createNewPost(data: ICreatePost){
        data.blogId = new Types.ObjectId(data.blogId)
        const blogToPost = await this.blogModel.findById(data.blogId).exec()
        if(!blogToPost){
            throw new NotFoundException()            
        }
        const newPost = new this.postModel(data)
        return await newPost.save()
    }

    async updatePost(postId:string, data: IPostUpdate){
        data.blogId = new Types.ObjectId(data.blogId)

        const postToUpdate = await this.postModel.findById(new Types.ObjectId(postId))
        if(!postToUpdate){
            throw new NotFoundException('Post does not exists')
        }
        
        const blogToAssign = await this.blogModel.findById(data.blogId)
        if(!blogToAssign){
            throw new NotFoundException('Blog does not exists')
        }
        postToUpdate.title = data.title
        postToUpdate.shortDescription = data.shortDescription
        postToUpdate.content = data.content
        postToUpdate.blogId = data.blogId

        return await postToUpdate.save()
        
    }

    async deletePostById(id:string){
        const postToDelete = await this.postModel.findOneAndDelete({_id: new Types.ObjectId(id)})
        if(!postToDelete){
            throw new NotFoundException('no such post')
        }
        return
    }

    async deleteAll(){
        return await this.postModel.deleteMany({})
    }


}