import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  missionId: number;

  @Column()
  senderType: string; // client | driver

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}