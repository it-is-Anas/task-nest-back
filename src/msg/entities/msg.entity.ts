import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Msg {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  msg: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'from' })
  from: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'to' })
  to: User;

  @Column({ default: false })
  seen: boolean;

  @Column({ default: false })
  delivered: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
