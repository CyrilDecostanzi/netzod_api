import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 250 })
  cover: string;

  @Column({ length: 200 })
  slug: string;

  @Column({ type: 'tinyint', width: 2 })
  status: number;

  @Column({ name: 'category_id', type: 'smallint' })
  categoryId: number;

  @Column({ name: 'published_at', type: 'datetime' })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.posts)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
