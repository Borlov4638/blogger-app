export class CreatePostDto {
    title:string
    shortDescription:string
    content:string
}

export class PostPaganationQuery {
    sortBy: string;
    sortDirection: string;
    pageNumber: number;
    pageSize: number;
  
}

export class PostUpdateDto {
    title:string
    shortDescription:string
    content:string
    blogId:string
}