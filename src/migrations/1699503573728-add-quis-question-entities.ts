import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuisQuestionEntities1699503573728 implements MigrationInterface {
    name = 'AddQuisQuestionEntities1699503573728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quiz-questions" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_529861efd595c5f9777aaca654f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_answers" ("id" SERIAL NOT NULL, "questionId" integer NOT NULL, CONSTRAINT "PK_3fefbc8a840a41b6a15a4f9ca5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quiz_answers" ADD CONSTRAINT "FK_78f9544421d6fd1dfa11b1f5f37" FOREIGN KEY ("questionId") REFERENCES "quiz-questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_answers" DROP CONSTRAINT "FK_78f9544421d6fd1dfa11b1f5f37"`);
        await queryRunner.query(`DROP TABLE "quiz_answers"`);
        await queryRunner.query(`DROP TABLE "quiz-questions"`);
    }

}
