import { DataSource } from "typeorm";
import { QuizQuestionEntity } from "../entities/quiz-question.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { QuizAnswersEntity } from "../entities/quis-answers.entity";
import { CreateQuizQuestionDto, QuizPaginationQuery, UpdateQuestionDto } from "../dto/quiz-questions.dto";

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

    async getAllQuestions(query: QuizPaginationQuery) {

        const pageNumber = query.pageNumber ? query.pageNumber : 1
        const pageSize = query.pageSize ? query.pageSize : 10
        const sortDirection = query.sortDirection == 'asc' ? 'ASC' : 'DESC'
        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const bodySearchTerm = query.bodySearchTerm ? query.bodySearchTerm : ''

        const itemsToSkip = (pageNumber - 1) * pageSize
        const totalCount = await this.dataSource.getRepository(QuizQuestionEntity).count()

        let questionsQuery = this.dataSource.getRepository(QuizQuestionEntity)
            .createQueryBuilder('q')
            .select('q.*')
            .addSelect(
                `COALESCE((SELECT json_agg(row) 
                FROM (
                    SELECT quiz_answers.*
                    FROM quiz_answers
                    WHERE "questionId" = "q"."id" 
                ) row
                ),'[]') as "array"`
            )
            .where(`q.body LIKE '%${bodySearchTerm}%'`)
            .orderBy(`"${sortBy}"`, sortDirection)
            .offset(itemsToSkip)
            .limit(pageSize)

        switch (query.publishedStatus) {
            case 'published':
                questionsQuery = questionsQuery.where('published = true')
                break
            case 'notPublished':
                questionsQuery = questionsQuery.where('published = false')
                break
        }
        const questions = await questionsQuery.getRawMany()

        questions.forEach((q) => {
            q.correctAnswers = q.array.map(ans => ans.answer);
            delete q.array
        })
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: questions
        }
    }

    async getQuestionById(id: number): Promise<QuizQuestionEntity> {
        return await this.dataSource.getRepository(QuizQuestionEntity).findOneBy({ id })
    }

    async deleteQuestion(id: number) {
        return (await this.dataSource.getRepository(QuizQuestionEntity).delete({ id })).affected
    }

    async updateQuestionById(id: number, data: UpdateQuestionDto) {
        this.dataSource.getRepository(QuizQuestionEntity)
            .createQueryBuilder('qq')
            .update()
            .execute()
    }
}