import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateQuizQuestionDto } from "../dto/quiz-questions.dto";
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository";

export class QuizQuestionCreateCommand {
    constructor(public data: CreateQuizQuestionDto) { }
}

@CommandHandler(QuizQuestionCreateCommand)
export class QuizQuestionCreateUseCase implements ICommandHandler<QuizQuestionCreateCommand> {
    constructor(
        private readonly quisQuestionRepo: QuizQuestionsRepository
    ) { }

    async execute(command: QuizQuestionCreateCommand) {
        return await this.quisQuestionRepo.insertQuestion(command.data)
    }
}