import { Module } from "@nestjs/common";
import { QuizQuestionsController } from "./controllers/quiz-questions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuizQuestionEntity } from "./entities/quiz-question.entity";
import { QuizAnswersEntity } from "./entities/quis-answers.entity";
import { QuizQuestionsRepository } from "./repositorys/quis-question.repository";
import { QuizQuestionCreateUseCase } from "./use-cases/create-question.use-case";
import { CqrsModule } from "@nestjs/cqrs";

const useCases = [QuizQuestionCreateUseCase]

@Module({
    controllers: [QuizQuestionsController],
    imports: [TypeOrmModule.forFeature([QuizQuestionEntity, QuizAnswersEntity]), CqrsModule],
    providers: [...useCases, QuizQuestionsRepository]
})

export class QuizModule { }