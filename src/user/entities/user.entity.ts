import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Msg } from '../../msg/entities/msg.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: null })
  imgSrc: string;

  @OneToMany(() => Msg, (msg) => msg.from)
  sentMessages: Msg[];

  @OneToMany(() => Msg, (msg) => msg.to)
  receivedMessages: Msg[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
