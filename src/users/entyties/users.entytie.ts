import { SessionPg } from "src/auth/enities/session.entitie";
import { CommentPg } from "src/comments/entitys/comment.entity";
import { CommentLikesPg } from "src/comments/entitys/comments-likes.entity";
import { Column, CreateDateColumn, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number
    @CreateDateColumn()
    createdAt: Date
    @Column()
    login: string
    @Column()
    email: string
    @Column()
    password: string
    @Column()
    @Generated("uuid")
    confirmationCode: string
    @Column()
    expirationDate: string
    @Column({ default: false })
    isConfirmed: boolean
    @OneToMany(() => SessionPg, s => s.user)
    sessions: SessionPg[]
    @OneToMany(() => CommentPg, c => c.user)
    comments: CommentPg[]
    @OneToMany(() => CommentLikesPg, cl => cl.userId)
    commentLikes: CommentLikesPg[]
}