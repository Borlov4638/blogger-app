import { PostPg } from "src/posts/entitys/post.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BlogPg {
    @PrimaryGeneratedColumn()
    id: number
    @CreateDateColumn()
    createdAt: Date
    @Column()
    name: string
    @Column()
    description: string
    @Column()
    websiteUrl: string
    @Column()
    isMembership: boolean
    @OneToMany(() => PostPg, p => p.blog)
    posts: Array<PostPg>
}