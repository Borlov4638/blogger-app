import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
    @Column({ array: true, type: 'varchar' })
    correctAnswers: Array<string>

    // @OneToMany(() => QuizAnswersEntity, (qa) => qa.questionId, { onDelete: 'CASCADE' })
    // correctAnswers: QuizAnswersEntity[]
}

