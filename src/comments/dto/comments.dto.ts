import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatus } from '../../enums/like-status.enum';

export class CommentChangeLikeStatusDto {
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
