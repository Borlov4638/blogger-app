import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QuizAnswersEntity } from "./quis-answers.entity";

@Entity('quiz-questions')
export class QuizQuestionEntity {
    @PrimaryGeneratedColumn()
    id: number | string
    @Column()
    body: string
    @Column({ default: false })
    published: boolean
    @CreateDateColumn()
    createdAt: Date
    @UpdateDateColumn()
    updatedAt: Date
    @OneToMany(() => QuizAnswersEntity, (qa) => qa.questionId, { onDelete: 'CASCADE' })
    correctAnswers: QuizAnswersEntity[]
}

