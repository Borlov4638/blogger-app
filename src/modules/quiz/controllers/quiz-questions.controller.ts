import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CreateQuizQuestionDto } from "../dto/quiz-questions.dto";
import { CommandBus } from "@nestjs/cqrs";
import { QuizQuestionCreateCommand } from "../use-cases/create-question.use-case";
import { BasicAuthGuard } from "src/auth/guards/auth.basic.guard";

@Controller('sa/quiz/questions')
export class QuizQuestionsController {
    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @Get()
    async getAllQuestions(

    ) {

    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createNewQuestion(
        @Body() data: CreateQuizQuestionDto
    ) {
        return await this.commandBus.execute(new QuizQuestionCreateCommand(data))
    }
}