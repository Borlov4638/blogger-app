import { LikeStatus } from '../../enums/like-status.enum';
import { UsersEntity } from '../../users/entyties/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';

@Entity('comments_likes')
export class CommentLikesEntity {
  @PrimaryColumn()
  commentId: number | string;

  @ManyToOne(() => CommentEntity, (c) => c.coommentLikes)
  @JoinColumn({ name: 'commentId' })
  comment: CommentEntity;

  @PrimaryColumn({})
  userId: number | string;

  @ManyToOne(() => UsersEntity, (u) => u.commentLikes)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @CreateDateColumn()
  created_at: Date;

  @Column({ enum: LikeStatus, type: 'enum' })
  status: LikeStatus;
}
