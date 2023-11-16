import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateQuestionDto } from "../dto/quiz-questions.dto";
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository";
import { NotFoundException } from "@nestjs/common";

export class UpdateQuestionCommand {
    constructor(
        public id: number,
        public data: UpdateQuestionDto
    ) { }
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand>{
    constructor(
        private readonly questionRepo: QuizQuestionsRepository
    ) { }

    async execute(command: UpdateQuestionCommand): Promise<any> {
        const isUpdated = await this.questionRepo.updateQuestionById(command.id, command.data)
        if (isUpdated == 0) {
            throw new NotFoundException()
        }
    }
}