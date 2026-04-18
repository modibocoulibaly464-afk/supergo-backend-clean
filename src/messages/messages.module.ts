import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './messages.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}