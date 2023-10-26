import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { PostEntity } from "./post.entity";
import { UsersEntity } from "src/users/entyties/users.entytie";
import { LikeStatus } from "src/enums/like-status.enum";

@Entity("posts_likes")
export class PostLikes {
    @PrimaryColumn()
    postId: number

    @PrimaryColumn()
    userId: string

    @ManyToOne(() => PostEntity, p => p.likes)
    @JoinColumn({ name: 'postId' })
    post: PostEntity;

    @ManyToOne(() => UsersEntity)
    @JoinColumn({ name: 'userId' })
    user: UsersEntity

    @CreateDateColumn()
    addedAt: Date

    @Column()
    login: string

    @Column({ enum: LikeStatus, default: LikeStatus.NONE, type: "enum" })
    status: LikeStatus
}