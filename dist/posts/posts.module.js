"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const posts_schema_1 = require("../entyties/posts.schema");
const posts_controller_1 = require("./posts.controller");
const posts_service_1 = require("./posts.service");
const blogs_schema_1 = require("../entyties/blogs.schema");
const posts_repository_1 = require("./posts.repository");
const comments_schema_1 = require("../entyties/comments.schema");
let PostsModule = class PostsModule {
};
exports.PostsModule = PostsModule;
exports.PostsModule = PostsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: posts_schema_1.Post.name, schema: posts_schema_1.postSchema }, { name: blogs_schema_1.Blog.name, schema: blogs_schema_1.BlogSchema }, { name: comments_schema_1.Comment.name, schema: comments_schema_1.commentsSchema }])],
        controllers: [posts_controller_1.PostController],
        providers: [posts_service_1.PostsService, posts_repository_1.PostRepository],
        exports: [posts_service_1.PostsService]
    })
], PostsModule);
//# sourceMappingURL=posts.module.js.map