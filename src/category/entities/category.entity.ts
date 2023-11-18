import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Exclude } from 'class-transformer';
import { Tag } from '../../tag/entities/tag.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 250, nullable: true })
  image: string;

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  category_id: number;

  @CreateDateColumn()
  @Exclude()
  created_at: Date;

  @UpdateDateColumn()
  @Exclude()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  @Exclude()
  deleted_at: Date;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @ManyToOne(() => Category, (category) => category.categories)
  @JoinColumn({ name: 'category_id' })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  categories: Category[];

  @OneToMany(() => Tag, (tag) => tag.category)
  tags: Tag[];
}
