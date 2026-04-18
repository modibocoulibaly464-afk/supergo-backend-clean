import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @Body()
    body: {
      missionId: number;
      senderType: string;
      senderId: number;
      receiverId: number;
      content: string;
    },
  ) {
    return this.messagesService.create(
      Number(body.missionId),
      body.senderType,
      Number(body.senderId),
      Number(body.receiverId),
      body.content,
    );
  }

  @Get('mission/:missionId')
  async findByMission(
    @Param('missionId', ParseIntPipe) missionId: number,
  ) {
    return this.messagesService.findByMission(missionId);
  }
}