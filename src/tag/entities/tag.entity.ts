import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity()
export class Tag {
  constructor(partial: Partial<Tag>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Category, (category) => category.tags)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
