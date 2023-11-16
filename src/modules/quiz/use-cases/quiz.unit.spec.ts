import { Test, TestingModule } from "@nestjs/testing"
import { QuizQuestionCreateUseCase } from "./create-question.use-case"
import { QuizQuestionsRepository } from "../repositorys/quis-question.repository"

describe('QuizUseCases', () => {

    let service: QuizQuestionCreateUseCase

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [QuizQuestionCreateUseCase, QuizQuestionsRepository]
        }).compile()

        service = module.get<QuizQuestionCreateUseCase>(QuizQuestionCreateUseCase)
    })

    it('shoud be defiend', () => {
        expect(service).toBeDefined()
    })
})