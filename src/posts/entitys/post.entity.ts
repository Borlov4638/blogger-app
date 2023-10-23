import { BlogPg } from "src/blogs/entitys/blogs.entity";
import { CommentPg } from "src/comments/entitys/comment.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostLikes } from "./post-likes.entity";

@Entity()
export class PostPg {
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn()
    createdAt: Date
    @Column()
    title: string
    @Column()
    shortDescription: string
    @Column()
    content: string
    @ManyToOne(() => BlogPg, b => b.posts)
    blog: BlogPg
    @OneToMany(() => CommentPg, c => c.post)
    comments: CommentPg[]
    @OneToMany(() => PostLikes, pl => pl.postId)
    likes: PostLikes[]
}