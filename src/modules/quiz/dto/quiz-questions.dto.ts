import { Transform, Type } from "class-transformer"
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested, isString } from "class-validator"

enum QuizPaginationSortBy {
    id = 'id',
    body = 'body',
    correctAnswers = 'correctAnswers',
    published = 'published',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt'
}

export class CreateQuizQuestionDto {
    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    body: string

    @IsArray()
    correctAnswers: Array<string>
}

export class QuizPaginationQuery {
    @IsOptional()
    @IsString()
    bodySearchTerm: string
    @IsOptional()
    @IsString()
    publishedStatus: string
    @IsOptional()
    @IsEnum(QuizPaginationSortBy)
    sortBy: QuizPaginationSortBy
    @IsOptional()
    sortDirection: string
    @IsOptional()
    @IsNumber()
    @IsPositive()
    pageNumber: number
    @IsOptional()
    @IsNumber()
    @IsPositive()
    pageSize: number
}

export class UpdateQuestionDto {
    @IsString()
    @IsNotEmpty()
    body: string
    @IsArray()
    @IsString({ each: true })
    correctAnswers: Array<string>
}