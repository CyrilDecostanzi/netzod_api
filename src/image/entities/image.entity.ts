import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';

@Entity()
export class Image {
  constructor(partial: Partial<Image>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'bigint' })
  post_id: number;

  @ManyToOne(() => Post, (post) => post.images)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ length: 250 })
  url: string;
}
