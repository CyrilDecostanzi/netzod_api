import { Exclude, Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';

export const { ACTIVE, INACTIVE } = {
  ACTIVE: 1,
  INACTIVE: 0,
};

@Entity()
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  username: string;

  @Unique(['email'])
  @Column({ length: 100 })
  email: string;

  @Column({ length: 30 })
  password: string;

  @Column({ type: 'tinyint', width: 2 })
  status: number;

  @Column({ type: 'tinyint', width: 1 })
  role_id: number;

  @Column({ length: 15, nullable: true })
  mobile: string;

  @Column({ length: 50 })
  @Expose({ groups: ['userDetails'] })
  firstname: string;

  @Column({ length: 50 })
  @Exclude()
  lastname: string;

  @Column({ length: 250, nullable: true })
  avatar: string;

  @Column({ length: 600, nullable: true })
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
