export class CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class BlogPaganationQuery {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class UpdateBlogDto {
  name:string
  description:string
  websiteUrl:string
}
