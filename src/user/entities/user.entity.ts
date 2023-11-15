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
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Role } from '../../role/entities/role.entity';

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
  @Expose({ groups: ['auth', 'admin'] })
  email: string;

  @Column({ length: 150 })
  @Exclude()
  password: string;

  @Column({ type: 'tinyint', width: 2 })
  @Exclude()
  status: number;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  @Exclude()
  role_id: number;

  @Column({ length: 15, nullable: true })
  @Expose({ groups: ['auth', 'admin'] })
  mobile: string;

  @Column({ length: 50 })
  firstname: string;

  @Column({ length: 50 })
  @Expose({ groups: ['auth', 'admin'] })
  lastname: string;

  @Column({ length: 250, nullable: true })
  avatar: string;

  @Column({ length: 600, nullable: true })
  @Expose({ groups: ['auth', 'user_detail'] })
  bio: string;

  @CreateDateColumn()
  @Expose({ groups: ['admin'] })
  created_at: Date;

  @UpdateDateColumn()
  @Expose({ groups: ['admin'] })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  @Expose({ groups: ['admin'] })
  deleted_at: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
