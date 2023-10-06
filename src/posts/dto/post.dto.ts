import { IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { LikeStatus } from "src/enums/like-status.enum";

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

export class PostLikeStatusDto{
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}

export class PostCreateNewCommentDto{
  @IsNotEmpty()
  @IsString()
  @Length(20, 300)
  content:string
}
