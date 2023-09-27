import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/blogs.dto';
import { BlogsRepository } from './blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../entyties/blogs.schema';
import { Model, Types } from 'mongoose';

interface IBlogPaganationQuery {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

interface IUpdateBlog {
  name:string
  description:string
  websiteUrl:string

}

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>, private readonly blogsRepo: BlogsRepository) {}

  async getAllBlogs(paganationQuery: IBlogPaganationQuery) {
    const searchNameTerm = paganationQuery.searchNameTerm ? paganationQuery.searchNameTerm : ''
    const sortBy = paganationQuery.sortBy ? paganationQuery.sortBy : "createdAt"
    const sortDirection = (paganationQuery.sortDirection === "asc") ? 1 : -1
    const sotringQuery = this.blogsRepo.blogsSortingQuery(sortBy, sortDirection)
    const pageNumber = paganationQuery.pageNumber ? +paganationQuery.pageNumber : 1
    const pageSize = paganationQuery.pageSize ? +paganationQuery.pageSize : 10
    const itemsToSkip = (pageNumber - 1) * pageSize

    const findedBlogs = await this.blogModel.find({ name: {$regex: searchNameTerm, $options:'i'}},{_id:false, __v:false})
    .sort(sotringQuery)
    .skip(itemsToSkip)
    .limit(pageSize)
    
    const totalCountOfItems = (await this.blogModel.find({ name: {$regex: searchNameTerm, $options:'i'}})).length

    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems,
        items: [...findedBlogs]
    }

    return mappedResponse

  }
  
  async createNewBlog(data: CreateBlogDto) {
    const createdBlog = new this.blogModel(data);
    return await createdBlog.save()
      .then(savedBlog =>{
        const plainBlog : BlogDocument = savedBlog.toObject() 
        delete plainBlog._id
        delete plainBlog.__v
        return plainBlog
      })
  }

  async getBlogById(blogId:string){
    
    const findedBlog = await this.blogModel.findById(new Types.ObjectId(blogId), {_id:false, __v:false}, {lean:true, sort: {'_id':-1}}).exec()
    if(!findedBlog){
      throw new NotFoundException()
    }
    return findedBlog
  }

  async updateBlogById(blogId:string, data: IUpdateBlog){
    const blogToUpdate  = await this.blogModel.findById(new Types.ObjectId(blogId))
    if(!blogToUpdate){
      throw new NotFoundException()
    }
    blogToUpdate.name = data.name
    blogToUpdate.description = data.description
    blogToUpdate.websiteUrl = data.websiteUrl
    await blogToUpdate.save()
    return
  }

  async deleteBlogById(blogId:string){
    const blogToDelete = await this.blogModel.findOneAndDelete({_id: new Types.ObjectId(blogId)})
    if(!blogToDelete){
      throw new NotFoundException("Could not find the Blog to Delete");
    }
    return
  }

  async getAllPostsInBlog(blogId: string){
    
  }

  
}
