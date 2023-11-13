import { SessionPg } from '../../auth/enities/session.entity';
import { CommentEntity } from '../../comments/entitys/comment.entity';
import { CommentLikesEntity } from '../../comments/entitys/comments-likes.entity';
import { PostLikesEntity } from '../../modules/posts/entitys/post-likes.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number | string;
  @CreateDateColumn()
  createdAt: Date;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  @Generated('uuid')
  confirmationCode: string;
  @Column('bigint')
  expirationDate: number;
  @Column({ default: false })
  isConfirmed: boolean;
  @OneToMany(() => PostLikesEntity, (pl) => pl.user, { onDelete: 'CASCADE' })
  postsLikes: PostLikesEntity[];
  @OneToMany(() => SessionPg, (s) => s.user, { onDelete: 'CASCADE' })
  sessions: SessionPg[];
  @OneToMany(() => CommentEntity, (c) => c.user)
  comments: CommentEntity[];
  @OneToMany(() => CommentLikesEntity, (cl) => cl.userId)
  commentLikes: CommentLikesEntity[];
}
