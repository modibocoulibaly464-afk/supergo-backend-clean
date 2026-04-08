import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DriversService } from './drivers.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DriversGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly driversService: DriversService) {}

  @SubscribeMessage('driverLocation')
  async handleLocation(
    @MessageBody()
    data: { id: number; lat: number; lng: number },
  ) {
    await this.driversService.updateLocation(
      data.id,
      data.lat,
      data.lng,
    );

    const drivers = await this.driversService.findAll();

    this.server.emit('driversUpdate', drivers);

    return { success: true };
  }

  @SubscribeMessage('getDrivers')
  async handleGetDrivers() {
    const drivers = await this.driversService.findAll();

    this.server.emit('driversUpdate', drivers);

    return drivers;
  }
}