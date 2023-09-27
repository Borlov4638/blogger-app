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
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const blogs_repository_1 = require("./blogs.repository");
const mongoose_1 = require("@nestjs/mongoose");
const blogs_schema_1 = require("../entyties/blogs.schema");
const mongoose_2 = require("mongoose");
let BlogsService = class BlogsService {
    constructor(blogModel, blogsRepo) {
        this.blogModel = blogModel;
        this.blogsRepo = blogsRepo;
    }
    async getAllBlogs(paganationQuery) {
        const searchNameTerm = paganationQuery.searchNameTerm ? paganationQuery.searchNameTerm : '';
        const sortBy = paganationQuery.sortBy ? paganationQuery.sortBy : "createdAt";
        const sortDirection = (paganationQuery.sortDirection === "asc") ? 1 : -1;
        const sotringQuery = this.blogsRepo.blogsSortingQuery(sortBy, sortDirection);
        const pageNumber = paganationQuery.pageNumber ? +paganationQuery.pageNumber : 1;
        const pageSize = paganationQuery.pageSize ? +paganationQuery.pageSize : 10;
        const itemsToSkip = (pageNumber - 1) * pageSize;
        const findedBlogs = await this.blogModel.find({ name: { $regex: searchNameTerm, $options: 'i' } }, { _id: false, __v: false })
            .sort(sotringQuery)
            .skip(itemsToSkip)
            .limit(pageSize);
        const totalCountOfItems = (await this.blogModel.find({ name: { $regex: searchNameTerm, $options: 'i' } })).length;
        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountOfItems,
            items: [...findedBlogs]
        };
        return mappedResponse;
    }
    async createNewBlog(data) {
        const createdBlog = new this.blogModel(data);
        return await createdBlog.save()
            .then(savedBlog => {
            const plainBlog = savedBlog.toObject();
            delete plainBlog._id;
            delete plainBlog.__v;
            return plainBlog;
        });
    }
    async getBlogById(blogId) {
        const findedBlog = await this.blogModel.findById(new mongoose_2.Types.ObjectId(blogId), { _id: false, __v: false }, { lean: true }).exec();
        if (!findedBlog) {
            throw new common_1.NotFoundException();
        }
        return findedBlog;
    }
    async updateBlogById(blogId, data) {
        const blogToUpdate = await this.blogModel.findById(new mongoose_2.Types.ObjectId(blogId));
        if (!blogToUpdate) {
            throw new common_1.NotFoundException();
        }
        blogToUpdate.name = data.name;
        blogToUpdate.description = data.description;
        blogToUpdate.websiteUrl = data.websiteUrl;
        await blogToUpdate.save();
        return;
    }
    async deleteBlogById(blogId) {
        const blogToDelete = await this.blogModel.findOneAndDelete({ _id: new mongoose_2.Types.ObjectId(blogId) });
        if (!blogToDelete) {
            throw new common_1.NotFoundException("Could not find the Blog to Delete");
        }
        return;
    }
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blogs_schema_1.Blog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, blogs_repository_1.BlogsRepository])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map