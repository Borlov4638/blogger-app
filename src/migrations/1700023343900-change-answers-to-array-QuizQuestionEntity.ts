import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAnswersToArrayQuizQuestionEntity1700023343900 implements MigrationInterface {
    name = 'ChangeAnswersToArrayQuizQuestionEntity1700023343900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz-questions" ADD "correctAnswers" character varying array NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz-questions" DROP COLUMN "correctAnswers"`);
    }

}
