export declare class CreateBlogDto {
    name: string;
    description: string;
    websiteUrl: string;
}
export declare class BlogPaganationQuery {
    searchNameTerm: string;
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
}
export declare class UpdateBlogDto {
    name: string;
    description: string;
    websiteUrl: string;
}
