import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuisQuestionEntities1699503997107 implements MigrationInterface {
    name = 'AddQuisQuestionEntities1699503997107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_answers" ADD "answer" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_answers" DROP COLUMN "answer"`);
    }

}
