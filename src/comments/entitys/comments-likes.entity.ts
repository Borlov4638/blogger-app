import { LikeStatus } from "src/enums/like-status.enum";
import { Users } from "src/users/entyties/users.entytie";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { CommentPg } from "./comment.entity";


@Entity()
export class CommentLikesPg {

    @PrimaryColumn()
    commentId: number;

    @ManyToOne(() => CommentPg, c => c.coommentLikes)
    @JoinColumn({ name: 'commentId' })
    comment: CommentPg;

    @PrimaryColumn({})
    userId: number;

    @ManyToOne(() => Users, u => u.commentLikes)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @CreateDateColumn()
    created_at: Date;

    @Column({ enum: LikeStatus, type: "enum" })
    status: LikeStatus;

}