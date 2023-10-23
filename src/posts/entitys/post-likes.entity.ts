import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { PostPg } from "./post.entity";
import { Users } from "src/users/entyties/users.entytie";
import { LikeStatus } from "src/enums/like-status.enum";

@Entity()
export class PostLikes {
    @PrimaryColumn()
    postId: number

    @PrimaryColumn()
    userId: string

    @ManyToOne(() => PostPg, p => p.likes)
    @JoinColumn({ name: 'postId' })
    post: PostPg;

    @ManyToOne(() => Users)
    @JoinColumn({ name: 'userId' })
    user: Users

    @CreateDateColumn()
    addedAt: Date

    @Column()
    login: string

    @Column({ enum: LikeStatus, default: LikeStatus.NONE, type: "enum" })
    status: LikeStatus
}