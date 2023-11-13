import { Transform } from "class-transformer"
import { IsArray, IsNotEmpty, IsString } from "class-validator"

export class CreateQuizQuestionDto {
    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    body: string

    @IsArray()
    correctAnswers: Array<string>
}
