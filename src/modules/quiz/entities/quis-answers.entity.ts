// import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
// import { QuizQuestionEntity } from "./quiz-question.entity";

// @Entity({ name: 'quiz_answers' })
// export class QuizAnswersEntity {
//     @PrimaryGeneratedColumn()
//     id: number | string

//     @Column()
//     answer: string

//     @Column()
//     questionId: number | string

//     @ManyToOne(() => QuizQuestionEntity, (qq) => qq.correctAnswers, { onDelete: 'CASCADE' })
//     @JoinColumn({ name: 'questionId' })
//     question: QuizQuestionEntity
// }

