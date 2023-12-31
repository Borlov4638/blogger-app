import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Validate,
  ValidationArguments,
  ValidationError,
  registerDecorator,
} from 'class-validator';
import { LikeStatus } from '../../enums/like-status.enum';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../entyties/blogs.schema';
import { Model, Types } from 'mongoose';
import { Transform } from 'class-transformer';

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
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.blogModel.findOne({
      _id: new Types.ObjectId(blogId),
    });
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
