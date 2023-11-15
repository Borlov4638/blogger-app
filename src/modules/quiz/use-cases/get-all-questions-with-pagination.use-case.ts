import { CommandHandler } from "@nestjs/cqrs";
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository";
import { QuizPaginationQuery } from "../dto/quiz-questions.dto";

export class GetAllQuestionsCommand {
    constructor(
        public query: QuizPaginationQuery
    ) { }
}

@CommandHandler(GetAllQuestionsCommand)
export class GetAllQuestionsUseCase {
    constructor(
        private readonly questionRepo: QuizQuestionsRepository,
    ) { }

    async execute(command: GetAllQuestionsCommand) {
        const questions = await this.questionRepo.getAllQuestions(command.query);
        return questions;
    }

}