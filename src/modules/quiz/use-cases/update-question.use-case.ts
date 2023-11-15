import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateQuestionDto } from "../dto/quiz-questions.dto";
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository";

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
        await this.questionRepo.updateQuestionById(command.id, command.data)
    }
}