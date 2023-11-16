import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectDataSource } from "@nestjs/typeorm";
import dataSource from "src/db/data-source";
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository";
import { UnauthorizedException } from "@nestjs/common";

export class ChangeQuestionPublishedStatusCommand {
    constructor(
        public id: number
    ) { }
}

@CommandHandler(ChangeQuestionPublishedStatusCommand)
export class ChangeQuestionPublishedStatusUseCase implements ICommandHandler<ChangeQuestionPublishedStatusCommand>{
    constructor(
        private questonRepository: QuizQuestionsRepository
    ) { }

    async execute(command: ChangeQuestionPublishedStatusCommand): Promise<any> {
        await this.questonRepository.changePublishedStatus(command.id)

    }

}