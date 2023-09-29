import { IsNotEmpty, IsString, Length, Matches } from "class-validator";


export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @Length(0,15)
  name: string;
  @IsString()
  @Length(0,500)
  description: string;
  @IsString()
  @Length(0,100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
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

  @IsString()
  @Length(0,15)
  name: string;
  @IsString()
  @Length(0,500)
  description: string;
  @IsString()
  @Length(0,100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string;
}
