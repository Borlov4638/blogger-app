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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { BlogPaganationQuery, CreateBlogDto, UpdateBlogDto } from './dto/blogs.dto';
import { BlogsService } from './blogs.service';
import { PostsService } from 'src/posts/posts.service';
export declare class BlogsController {
    private readonly blogsService;
    private readonly postService;
    constructor(blogsService: BlogsService, postService: PostsService);
    getAllBlog(query: BlogPaganationQuery): Promise<{
        pagesCount: number;
        page: number;
        pageSize: number;
        totalCount: number;
        items: (import("mongoose").Document<unknown, {}, import("../entyties/blogs.schema").Blog> & import("../entyties/blogs.schema").Blog & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
    }>;
    createBlog(createBlogDto: CreateBlogDto): Promise<import("mongoose").Document<unknown, {}, import("../entyties/blogs.schema").Blog> & import("../entyties/blogs.schema").Blog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getBlogById(id: string): Promise<import("mongoose").FlattenMaps<import("../entyties/blogs.schema").Blog> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateBlog(id: string, updateBlogDto: UpdateBlogDto): Promise<void>;
    deleteBlogById(id: string): Promise<void>;
    getPostsByBlogId(id: string): void;
    createPostByBlogId(blogId: string, title: string, shortDescription: string, content: string): Promise<import("mongoose").Document<unknown, {}, import("../entyties/posts.schema").Post> & import("../entyties/posts.schema").Post & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
