import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  AfterLoad,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Image } from '../../image/entities/image.entity';
import { Exclude } from 'class-transformer';
import { PostStatus } from './post.status.enum';
@Entity()
export class Post {
  constructor(partial: Partial<Post>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  @Exclude()
  user_id: number;

  @Column({ length: 150, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 450, nullable: true })
  description: string;

  @Column({ length: 250, nullable: true })
  cover: string;

  @Column({ length: 200, nullable: true, unique: true })
  slug: string;

  @Column({ type: 'tinyint', width: 2, default: PostStatus.DRAFT })
  status: number;

  @Column({ name: 'category_id', type: 'smallint', nullable: true, default: 1 })
  category_id: number;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  published_at: Date;

  @Column({ name: 'featured', type: 'boolean', default: false })
  featured: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.posts)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Image, (image) => image.post)
  images: Image[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'post_likes',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  liked_by: User[];

  like_count: number;

  @AfterLoad()
  countLikes() {
    this.like_count = this.liked_by?.length || 0; // Calculer le nombre de likes
  }
}
