import { BlogEntity } from "src/blogs/entitys/blogs.entity";
import { CommentEntity } from "src/comments/entitys/comment.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostLikes } from "./post-likes.entity";

@Entity("posts")
export class PostEntity {
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
    @ManyToOne(() => BlogEntity, b => b.posts)
    blog: BlogEntity
    @OneToMany(() => CommentEntity, c => c.post)
    comments: CommentEntity[]
    @OneToMany(() => PostLikes, pl => pl.postId)
    likes: PostLikes[]
}