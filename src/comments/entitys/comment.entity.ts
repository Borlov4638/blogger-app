import { PostEntity } from '../../modules/posts/entitys/post.entity';
import { UsersEntity } from '../../users/entyties/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentLikesEntity } from './comments-likes.entity';
import { SrvRecord } from 'dns';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number | string;
  @CreateDateColumn()

  createdAt: Date;

  @Column()
  content: string;

  @Column()
  userId: number | string

  @Column()
  postId: number | string;

  @Column()
  userLogin: string;

  @OneToMany(() => CommentLikesEntity, (cl) => cl.commentId)
  coommentLikes: CommentLikesEntity[];

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "postId" })
  post: PostEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "userId" })
  user: UsersEntity;
}
