import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Comment {
  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'user_id', type: 'bigint' })
  @Exclude()
  user_id: number;

  @Column({ name: 'post_id', type: 'bigint' })
  @Exclude()
  post_id: number;

  @Column({ type: 'tinyint', width: 2 })
  status: number;

  @Column({ type: 'datetime', nullable: true })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
