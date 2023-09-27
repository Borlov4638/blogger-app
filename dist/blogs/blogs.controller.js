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
exports.BlogsController = void 0;
const common_1 = require("@nestjs/common");
const blogs_dto_1 = require("./dto/blogs.dto");
const blogs_service_1 = require("./blogs.service");
const posts_service_1 = require("../posts/posts.service");
let BlogsController = class BlogsController {
    constructor(blogsService, postService) {
        this.blogsService = blogsService;
        this.postService = postService;
    }
    getAllBlog(query) {
        return this.blogsService.getAllBlogs(query);
    }
    async createBlog(createBlogDto) {
        return await this.blogsService.createNewBlog(createBlogDto);
    }
    async getBlogById(id) {
        return await this.blogsService.getBlogById(id);
    }
    async updateBlog(id, updateBlogDto) {
        return await this.blogsService.updateBlogById(id, updateBlogDto);
    }
    async deleteBlogById(id) {
        return await this.blogsService.deleteBlogById(id);
    }
    getPostsByBlogId(id) { }
    async createPostByBlogId(blogId, title, shortDescription, content) {
        return await this.postService.createNewPost({ title, shortDescription, content }, blogId);
    }
};
exports.BlogsController = BlogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogs_dto_1.BlogPaganationQuery]),
    __metadata("design:returntype", void 0)
], BlogsController.prototype, "getAllBlog", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogs_dto_1.CreateBlogDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "createBlog", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "getBlogById", null);
__decorate([
    (0, common_1.HttpCode)(204),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, blogs_dto_1.UpdateBlogDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "updateBlog", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "deleteBlogById", null);
__decorate([
    (0, common_1.Get)(':blogId/posts'),
    __param(0, (0, common_1.Param)('blogsId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlogsController.prototype, "getPostsByBlogId", null);
__decorate([
    (0, common_1.Post)(':blogId/posts'),
    __param(0, (0, common_1.Param)('blogId')),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('shortDescription')),
    __param(3, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "createPostByBlogId", null);
exports.BlogsController = BlogsController = __decorate([
    (0, common_1.Controller)('blogs'),
    __metadata("design:paramtypes", [blogs_service_1.BlogsService, posts_service_1.PostsService])
], BlogsController);
//# sourceMappingURL=blogs.controller.js.map