import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  user_id_from: number;

  @Column()
  user_id_to: number;

  @Column()
  timestamp: Date;
}
