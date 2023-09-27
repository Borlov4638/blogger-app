"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsRepository = void 0;
class BlogsRepository {
    blogsSortingQuery(sortBy, sortDirection) {
        switch (sortBy) {
            case "id":
                return { id: sortDirection };
            case "name":
                return { name: sortDirection };
            case "description":
                return { description: sortDirection };
            case "websiteUrl":
                return { websiteUrl: sortDirection };
            case "isMembership":
                return { isMembership: sortDirection };
            case "createdAt":
                return { createdAt: sortDirection };
            default:
                return { createdAt: 1 };
        }
    }
}
exports.BlogsRepository = BlogsRepository;
//# sourceMappingURL=blogs.repository.js.map