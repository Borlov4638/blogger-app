"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
class PostRepository {
    postsSortingQuery(sortBy, sortDirection) {
        switch (sortBy) {
            case "id":
                return { id: sortDirection };
            case "title":
                return { title: sortDirection };
            case "shortDescription":
                return { shortDescription: sortDirection };
            case "content":
                return { content: sortDirection };
            case "blogId":
                return { blogId: sortDirection };
            case "blogName":
                return { blogName: sortDirection };
            case "createdAt":
                return { createdAt: sortDirection };
            default:
                return { createdAt: 1 };
        }
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=posts.repository.js.map