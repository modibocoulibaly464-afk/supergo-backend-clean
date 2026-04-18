import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DriversService } from './drivers.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DriversGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly driversService: DriversService) {}

  handleConnection(client: Socket) {
    console.log('Socket connecté:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Socket déconnecté:', client.id);
  }

  @SubscribeMessage('joinClientRoom')
  handleJoinClientRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: number },
  ) {
    const room = `client_${data.clientId}`;
    client.join(room);
    console.log(`Client ${client.id} a rejoint ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('joinDriverRoom')
  handleJoinDriverRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: number },
  ) {
    const room = `driver_${data.driverId}`;
    client.join(room);
    console.log(`Driver ${client.id} a rejoint ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leaveClientRoom')
  handleLeaveClientRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clientId: number },
  ) {
    const room = `client_${data.clientId}`;
    client.leave(room);
    return { success: true };
  }

  @SubscribeMessage('leaveDriverRoom')
  handleLeaveDriverRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: number },
  ) {
    const room = `driver_${data.driverId}`;
    client.leave(room);
    return { success: true };
  }

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

    this.server.emit('driverLocationUpdated', {
      driverId: data.id,
      lat: data.lat,
      lng: data.lng,
    });

    this.server.to(`driver_${data.id}`).emit('driverLocationUpdated', {
      driverId: data.id,
      lat: data.lat,
      lng: data.lng,
    });

    return { success: true };
  }

  @SubscribeMessage('driverLocationUpdate')
  async handleDriverLocationUpdate(
    @MessageBody()
    data: { driverId: number; lat: number; lng: number },
  ) {
    await this.driversService.updateLocation(
      data.driverId,
      data.lat,
      data.lng,
    );

    const drivers = await this.driversService.findAll();

    this.server.emit('driversUpdate', drivers);

    this.server.emit('driverLocationUpdated', {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
    });

    this.server.to(`driver_${data.driverId}`).emit('driverLocationUpdated', {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
    });

    return { success: true };
  }

  @SubscribeMessage('missionStatusUpdate')
  handleMissionStatusUpdate(
    @MessageBody()
    data: {
      missionId: number;
      status: string;
      clientId?: number;
      driverId?: number;
      pickupLat?: number;
      pickupLng?: number;
      destinationLat?: number;
      destinationLng?: number;
    },
  ) {
    const payload = {
      missionId: data.missionId,
      status: data.status,
      driverId: data.driverId,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      destinationLat: data.destinationLat,
      destinationLng: data.destinationLng,
    };

    if (data.clientId != null) {
      this.server.to(`client_${data.clientId}`).emit('missionUpdated', payload);
    }

    if (data.driverId != null) {
      this.server.to(`driver_${data.driverId}`).emit('missionUpdated', payload);
    }

    return { success: true };
  }

  @SubscribeMessage('getDrivers')
  async handleGetDrivers() {
    const drivers = await this.driversService.findAll();
    this.server.emit('driversUpdate', drivers);
    return drivers;
  }

  emitMissionUpdate(data: {
    missionId: number;
    status: string;
    clientId?: number;
    driverId?: number;
    pickupLat?: number;
    pickupLng?: number;
    destinationLat?: number;
    destinationLng?: number;
  }) {
    const payload = {
      missionId: data.missionId,
      status: data.status,
      driverId: data.driverId,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      destinationLat: data.destinationLat,
      destinationLng: data.destinationLng,
    };

    if (data.clientId != null) {
      this.server.to(`client_${data.clientId}`).emit('missionUpdated', payload);
    }

    if (data.driverId != null) {
      this.server.to(`driver_${data.driverId}`).emit('missionUpdated', payload);
    }
  }
}