import { BlogEntity } from '../../blogs/entitys/blogs.entity';
import { CommentEntity } from '../../../comments/entitys/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostLikesEntity } from './post-likes.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number | string;
  @CreateDateColumn()
  createdAt: Date;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @ManyToOne(() => BlogEntity, (b) => b.posts, { onDelete: 'CASCADE' })
  blog: BlogEntity;
  @OneToMany(() => CommentEntity, (c) => c.post, { onDelete: 'CASCADE' })
  comments: CommentEntity[];
  @OneToMany(() => PostLikesEntity, (pl) => pl.post, { onDelete: 'CASCADE' })
  likes: PostLikesEntity[];
}
