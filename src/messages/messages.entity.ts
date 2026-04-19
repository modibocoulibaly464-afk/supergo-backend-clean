import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  missionId!: number;

  @Column()
  senderType!: string;

  @Column()
  senderId!: number;

  @Column()
  receiverId!: number;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}