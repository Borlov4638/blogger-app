import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateQuizQuestionDto, QuizPaginationQuery, UpdateQuestionDto } from "../dto/quiz-questions.dto";
import { CommandBus } from "@nestjs/cqrs";
import { QuizQuestionCreateCommand } from "../use-cases/create-question.use-case";
import { BasicAuthGuard } from "src/auth/guards/auth.basic.guard";
import { GetAllQuestionsCommand } from "../use-cases/get-all-questions-with-pagination.use-case";
import { DeleteQuestionCommand } from "../use-cases/delete-question.use-case";
import { UpdateQuestionCommand } from "../use-cases/update-question.use-case";

@Controller('sa/quiz/questions')
export class QuizQuestionsController {
    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @Get()
    async getAllQuestions(
        @Query() query: QuizPaginationQuery
    ) {
        return await this.commandBus.execute(new GetAllQuestionsCommand(query))
    }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(BasicAuthGuard)
    @Post()
    async createNewQuestion(
        @Body() data: CreateQuizQuestionDto
    ) {
        return await this.commandBus.execute(new QuizQuestionCreateCommand(data))
    }

    @Put(':id')
    async updateQuestion(@Param('id', new ParseIntPipe()) questionId: number, @Body() data: UpdateQuestionDto) {
        return await this.commandBus.execute(new UpdateQuestionCommand(questionId, data))
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    async deleteQuestion(@Param('id', new ParseIntPipe()) questionId: number) {
        return await this.commandBus.execute(new DeleteQuestionCommand(questionId))
    }


}