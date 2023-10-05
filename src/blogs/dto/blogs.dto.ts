import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";


export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value?.trim())
  @Length(0,15)
  name: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value?.trim())
  @Length(0,500)
  description: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value?.trim())
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
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value?.trim())
  @Length(0,15)
  name: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value?.trim())
  @Length(0,500)
  description: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value?.trim())
  @Length(0,100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string;
}

export class CreatePostByBlogIdDto{
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value.trim())
  @Length(0, 30)
  title:string
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value.trim())
  @Length(0, 100)
  shortDescription:string
  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => value.trim())
  @Length(0, 1000)
  content:string
}
