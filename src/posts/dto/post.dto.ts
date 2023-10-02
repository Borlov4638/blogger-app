import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @Length(0,30)
  title: string;
  @IsString()
  @Length(0,100)
  shortDescription: string;
  @IsString()
  @Length(0,1000)
  content: string;
  @IsNotEmpty()
  @IsString()
  @Length(24,24)
  blogId:string
}

export class PostPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class PostUpdateDto {
  @IsString()
  @Length(0,30)
  title: string;
  @IsString()
  @Length(0,100)
  shortDescription: string;
  @IsString()
  @Length(0,1000)
  content: string;
  @IsString()
  @Length(24,24)
  blogId: string;
}
export class PostsCommentsPaganation{
  pageNumber:string
  pageSize:string
  sortBy:string
  sortDirection:string
}
