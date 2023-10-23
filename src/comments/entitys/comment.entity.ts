import { PostPg } from "src/posts/entitys/post.entity";
import { Users } from "src/users/entyties/users.entytie";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CommentLikesPg } from "./comments-likes.entity";

@Entity()
export class CommentPg {
    @PrimaryGeneratedColumn()
    id: number
    @CreateDateColumn()
    createdAt: Date
    @Column()
    content: string
    @Column()
    userLogin: string
    @OneToMany(() => CommentLikesPg, cl => cl.commentId)
    coommentLikes: CommentLikesPg[]
    @ManyToOne(() => PostPg)
    post: PostPg;
    @ManyToOne(() => Users)
    user: Users
}