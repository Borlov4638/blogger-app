import { ColumnTypeUndefinedError, DataSource, Repository } from "typeorm";
import { QuizQuestionEntity } from "../entities/quiz-question.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { QuizAnswersEntity } from "../entities/quis-answers.entity";
import { CreateQuizQuestionDto } from "../dto/quiz-questions.dto";

export class QuizQuestionsRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) { }


    async insertQuestion(question: CreateQuizQuestionDto) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const quizQuestionRepo = queryRunner.manager.getRepository<QuizQuestionEntity>(QuizQuestionEntity)
        const quizAnswerRepo = queryRunner.manager.getRepository<QuizAnswersEntity>(QuizAnswersEntity)


        try {
            const newQuestion = new QuizQuestionEntity()
            newQuestion.body = question.body

            await quizQuestionRepo.save(newQuestion)

            const correctAnswers = question.correctAnswers.map(question => quizAnswerRepo.create({ answer: question, question: newQuestion }))

            await quizAnswerRepo.save(correctAnswers)
            await queryRunner.commitTransaction()

            return { ...newQuestion, correctAnswers: question.correctAnswers }

        } catch (err) {
            await queryRunner.rollbackTransaction();
            return err
        }


    }
}