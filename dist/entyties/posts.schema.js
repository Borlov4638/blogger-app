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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = exports.Post = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const like_status_enum_1 = require("../enums/like-status.enum");
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Post.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Post.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Post.prototype, "shortDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Post.prototype, "blogId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Post.prototype, "blogName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: new Date() }),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: { usersWhoLiked: [{ userId: String, login: String, addedAt: Number }], usersWhoDisliked: [String] },
        default: { usersWhoLiked: [], usersWhoDisliked: [] }, _id: false
    }),
    __metadata("design:type", Object)
], Post.prototype, "likesInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: { likesCount: Number, dislikesCount: Number, myStatus: String, newestLikes: [{ addedAt: String, userId: String, login: String }] },
        default: { likesCount: 0, dislikesCount: 0, myStatus: like_status_enum_1.LikeStatus.NONE, newestLikes: [] }, _id: false
    }),
    __metadata("design:type", Object)
], Post.prototype, "extenextendedLikesInfo", void 0);
exports.Post = Post = __decorate([
    (0, mongoose_1.Schema)()
], Post);
exports.postSchema = mongoose_1.SchemaFactory.createForClass(Post);
exports.postSchema.pre('save', function (next) {
    if (!this._id) {
        this._id = this.id = new mongoose_2.Types.ObjectId();
    }
    next();
});
//# sourceMappingURL=posts.schema.js.map