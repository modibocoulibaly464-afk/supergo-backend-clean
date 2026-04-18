import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './messages.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  async create(
    missionId: number,
    senderType: string,
    senderId: number,
    receiverId: number,
    content: string,
  ) {
    const message = this.messagesRepository.create({
      missionId,
      senderType,
      senderId,
      receiverId,
      content,
    });

    return this.messagesRepository.save(message);
  }

  async findByMission(missionId: number) {
    return this.messagesRepository.find({
      where: { missionId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }
}