import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column({ type: 'tinyint', width: 2 })
  status: number;

  @Column({ type: 'int', width: 1 })
  role_id: number;

  @Column({ length: 15 })
  mobile: string;

  @Column({ length: 50 })
  firstname: string;

  @Column({ length: 50 })
  lastname: string;

  @Column({ length: 250 })
  avatar: string;

  @Column({ length: 600 })
  bio: string;
}
