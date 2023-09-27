"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsModule = void 0;
const common_1 = require("@nestjs/common");
const blogs_controller_1 = require("./blogs.controller");
const mongoose_1 = require("@nestjs/mongoose");
const blogs_schema_1 = require("../entyties/blogs.schema");
const blogs_service_1 = require("./blogs.service");
const blogs_repository_1 = require("./blogs.repository");
const posts_module_1 = require("../posts/posts.module");
let BlogsModule = class BlogsModule {
};
exports.BlogsModule = BlogsModule;
exports.BlogsModule = BlogsModule = __decorate([
    (0, common_1.Module)({
        controllers: [blogs_controller_1.BlogsController],
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: blogs_schema_1.Blog.name, schema: blogs_schema_1.BlogSchema }]),
            posts_module_1.PostsModule
        ],
        providers: [blogs_service_1.BlogsService, blogs_repository_1.BlogsRepository],
    })
], BlogsModule);
//# sourceMappingURL=blogs.module.js.map