export declare class CreatePostDto {
    title: string;
    shortDescription: string;
    content: string;
}
export declare class PostPaganationQuery {
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
}
export declare class PostUpdateDto {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}
