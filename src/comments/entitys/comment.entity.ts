import { PostEntity } from 'src/posts/entitys/post.entity';
import { UsersEntity } from 'src/users/entyties/users.entytie';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentLikesEntity } from './comments-likes.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number | string;
  @CreateDateColumn()
  createdAt: Date;
  @Column()
  content: string;
  @Column()
  userLogin: string;
  @OneToMany(() => CommentLikesEntity, (cl) => cl.commentId)
  coommentLikes: CommentLikesEntity[];
  @ManyToOne(() => PostEntity)
  post: PostEntity;
  @ManyToOne(() => UsersEntity)
  user: UsersEntity;
}
