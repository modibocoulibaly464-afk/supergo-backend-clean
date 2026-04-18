import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody()
    data: {
      missionId: number;
      senderType: string;
      senderId: number;
      receiverId: number;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('new_message', data);
    return { ok: true };
  }
}