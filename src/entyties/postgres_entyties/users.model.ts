import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserPg {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    createdAt: string
    @Column()
    login: string
    @Column()
    password: string
    @Column()
    email: string
    @Column()
    confirmationCode: string
    @Column()
    expirationDate: string
    @Column()
    isConfirmed: boolean

}