import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import { LikeStatus } from '../../enums/like-status.enum';
import {
  Injectable,
} from '@nestjs/common';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogByIdCommand } from 'src/blogs/use-cases/get-blog-by-id';

export function isBlogIdValid(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: CustomBlogIdValidation,
    });
  };
}

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class CustomBlogIdValidation implements ValidatorConstraintInterface {
  constructor(private commandBus: CommandBus) { }

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.commandBus.execute(new GetBlogByIdCommand(blogId))
    if (!blog) {
      return false;
    } else {
      return true;
    }
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'blog does not exists';
  }
}

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 1000)
  content: string;
  @IsNotEmpty()
  @IsString()
  @Length(24, 24)
  @isBlogIdValid()
  blogId: string;
}

export class PostPaganationQuery {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}

export class PostUpdateDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 1000)
  content: string;
  @IsNotEmpty()
  @IsString()
  @Length(24, 24)
  @isBlogIdValid()
  blogId: string;
}
export class PostsCommentsPaganation {
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: string;
}

export class PostLikeStatusDto {
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

export class PostCreateNewCommentDto {
  @IsNotEmpty()
  @IsString()
  @Length(20, 300)
  content: string;
}
