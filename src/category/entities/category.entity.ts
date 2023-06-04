import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 250 })
  image: string;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: number;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @ManyToOne(() => Category, (category) => category.categories)
  @JoinColumn({ name: 'category_id' })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  categories: Category[];
}
