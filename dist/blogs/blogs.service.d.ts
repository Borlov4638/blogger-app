/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { CreateBlogDto } from './dto/blogs.dto';
import { BlogsRepository } from './blogs.repository';
import { Blog } from 'src/entyties/blogs.schema';
import { Model, Types } from 'mongoose';
interface IBlogPaganationQuery {
    searchNameTerm: string;
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
}
interface IUpdateBlog {
    name: string;
    description: string;
    websiteUrl: string;
}
export declare class BlogsService {
    private blogModel;
    private readonly blogsRepo;
    constructor(blogModel: Model<Blog>, blogsRepo: BlogsRepository);
    getAllBlogs(paganationQuery: IBlogPaganationQuery): Promise<{
        pagesCount: number;
        page: number;
        pageSize: number;
        totalCount: number;
        items: (import("mongoose").Document<unknown, {}, Blog> & Blog & Required<{
            _id: Types.ObjectId;
        }>)[];
    }>;
    createNewBlog(data: CreateBlogDto): Promise<import("mongoose").Document<unknown, {}, Blog> & Blog & Required<{
        _id: Types.ObjectId;
    }>>;
    getBlogById(blogId: string): Promise<import("mongoose").FlattenMaps<Blog> & Required<{
        _id: Types.ObjectId;
    }>>;
    updateBlogById(blogId: string, data: IUpdateBlog): Promise<void>;
    deleteBlogById(blogId: string): Promise<void>;
}
export {};
