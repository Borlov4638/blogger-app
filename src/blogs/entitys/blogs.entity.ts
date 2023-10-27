import { PostEntity } from "src/posts/entitys/post.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("blogs")
export class BlogEntity {
    @PrimaryGeneratedColumn()
    id: number | string
    @CreateDateColumn()
    createdAt: Date
    @Column()
    name: string
    @Column()
    description: string
    @Column()
    websiteUrl: string
    @Column({ default: false })
    isMembership: boolean
    @OneToMany(() => PostEntity, p => p.blog)
    posts: Array<PostEntity>
}