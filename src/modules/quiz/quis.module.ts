import { Module } from "@nestjs/common";
import { QuizQuestionsController } from "./controllers/quiz-questions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuizQuestionEntity } from "./entities/quiz-question.entity";
import { QuizQuestionsRepository } from "./repositorys/quis-question.repository";
import { QuizQuestionCreateUseCase } from "./use-cases/create-question.use-case";
import { CqrsModule } from "@nestjs/cqrs";
import { GetAllQuestionsUseCase } from "./use-cases/get-all-questions-with-pagination.use-case";
import { DeleteQuestionUseCase } from "./use-cases/delete-question.use-case";
import { UpdateQuestionUseCase } from "./use-cases/update-question.use-case";
import { ChangeQuestionPublishedStatusUseCase } from "./use-cases/change-question-published-status.use-case";

const useCases = [QuizQuestionCreateUseCase, GetAllQuestionsUseCase, DeleteQuestionUseCase, UpdateQuestionUseCase, ChangeQuestionPublishedStatusUseCase]

@Module({
    controllers: [QuizQuestionsController],
    imports: [TypeOrmModule.forFeature([QuizQuestionEntity]), CqrsModule],
    providers: [...useCases, QuizQuestionsRepository]
})

export class QuizModule { }