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
import { Model, Types } from "mongoose";
import { Blog } from "src/entyties/blogs.schema";
import { Post } from "src/entyties/posts.schema";
import { PostRepository } from "./posts.repository";
interface ICreatePost {
    title: string;
    shortDescription: string;
    content: string;
}
interface IPostPaganationQuery {
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
}
interface IPostUpdate {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string | Types.ObjectId;
}
export declare class PostsService {
    private postModel;
    private blogModel;
    private readonly postRepo;
    constructor(postModel: Model<Post>, blogModel: Model<Blog>, postRepo: PostRepository);
    getAllPosts(postPagonationQuery: IPostPaganationQuery): Promise<{
        pagesCount: number;
        page: number;
        pageSize: number;
        totalCount: number;
        items: (import("mongoose").Document<unknown, {}, Post> & Post & Required<{
            _id: Types.ObjectId;
        }>)[];
    }>;
    getPostById(postId: string): Promise<import("mongoose").Document<unknown, {}, Post> & Post & Required<{
        _id: Types.ObjectId;
    }>>;
    createNewPost(data: ICreatePost, blogId: string): Promise<import("mongoose").Document<unknown, {}, Post> & Post & Required<{
        _id: Types.ObjectId;
    }>>;
    updatePost(postId: string, data: IPostUpdate): Promise<void>;
    deletePostById(id: string): Promise<void>;
    deleteAll(): Promise<import("mongodb").DeleteResult>;
}
export {};
