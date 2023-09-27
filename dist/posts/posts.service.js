"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const blogs_schema_1 = require("../entyties/blogs.schema");
const posts_schema_1 = require("../entyties/posts.schema");
const posts_repository_1 = require("./posts.repository");
let PostsService = class PostsService {
    constructor(postModel, blogModel, postRepo) {
        this.postModel = postModel;
        this.blogModel = blogModel;
        this.postRepo = postRepo;
    }
    async getAllPosts(postPagonationQuery) {
        const sortBy = postPagonationQuery.sortBy ? postPagonationQuery.sortBy : "createdAt";
        const sortDirection = (postPagonationQuery.sortDirection === "asc") ? 1 : -1;
        const sotringQuery = this.postRepo.postsSortingQuery(sortBy, sortDirection);
        const pageNumber = postPagonationQuery.pageNumber ? +postPagonationQuery.pageNumber : 1;
        const pageSize = postPagonationQuery.pageSize ? +postPagonationQuery.pageSize : 10;
        const itemsToSkip = (pageNumber - 1) * pageSize;
        const findedPosts = await this.postModel.find({}, { _id: false, __v: false, likesInfo: false })
            .sort(sotringQuery)
            .skip(itemsToSkip)
            .limit(pageSize);
        const totalCountOfItems = (await this.postModel.find({})).length;
        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountOfItems,
            items: [...findedPosts]
        };
        return mappedResponse;
    }
    async getPostById(postId) {
        const findedPost = await this.postModel.findById(new mongoose_2.Types.ObjectId(postId), { _id: false, __v: false, likesInfo: false }).exec();
        if (!findedPost) {
            throw new common_1.NotFoundException('no such post');
        }
        return findedPost;
    }
    async createNewPost(data, blogId) {
        const blogToPost = await this.blogModel.findById(new mongoose_2.Types.ObjectId(blogId)).exec();
        if (!blogToPost) {
            throw new common_1.NotFoundException();
        }
        const newPost = new this.postModel({ ...data, blogId, blogName: blogToPost.name });
        return await newPost.save().then(newPost => {
            const plainPost = newPost.toObject();
            delete plainPost.__v;
            delete plainPost._id;
            delete plainPost.likesInfo;
            return plainPost;
        });
    }
    async updatePost(postId, data) {
        data.blogId = new mongoose_2.Types.ObjectId(data.blogId);
        const postToUpdate = await this.postModel.findById(new mongoose_2.Types.ObjectId(postId));
        if (!postToUpdate) {
            throw new common_1.NotFoundException('Post does not exists');
        }
        const blogToAssign = await this.blogModel.findById(data.blogId);
        if (!blogToAssign) {
            throw new common_1.NotFoundException('Blog does not exists');
        }
        postToUpdate.title = data.title;
        postToUpdate.shortDescription = data.shortDescription;
        postToUpdate.content = data.content;
        postToUpdate.blogId = data.blogId;
        await postToUpdate.save();
        return;
    }
    async deletePostById(id) {
        const postToDelete = await this.postModel.findOneAndDelete({ _id: new mongoose_2.Types.ObjectId(id) });
        if (!postToDelete) {
            throw new common_1.NotFoundException('no such post');
        }
        return;
    }
    async deleteAll() {
        return await this.postModel.deleteMany({});
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    __param(0, (0, mongoose_1.InjectModel)(posts_schema_1.Post.name)),
    __param(1, (0, mongoose_1.InjectModel)(blogs_schema_1.Blog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model, posts_repository_1.PostRepository])
], PostsService);
//# sourceMappingURL=posts.service.js.map