import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository";
import { NotFoundException } from "@nestjs/common";

export class DeleteQuestionCommand {
    constructor(public id: number) { }
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand>{
    constructor(
        private readonly questionRepository: QuizQuestionsRepository
    ) { }

    async execute(command: DeleteQuestionCommand): Promise<any> {
        const question = await this.questionRepository.deleteQuestion(command.id)
        if (!question) {
            throw new NotFoundException('question not found')
        }
    }

}