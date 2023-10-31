import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UsersEntity } from '../../users/entyties/users.entity';
import { LikeStatus } from '../../enums/like-status.enum';

@Entity('posts_likes')
export class PostLikesEntity {
  @PrimaryColumn()
  postId: number;

  @PrimaryColumn()
  userId: string;

  @ManyToOne(() => PostEntity, (p) => p.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => UsersEntity, (u) => u.postsLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @CreateDateColumn()
  addedAt: Date;

  @Column()
  login: string;

  @Column({ enum: LikeStatus, default: LikeStatus.NONE, type: 'enum' })
  status: LikeStatus;
}
