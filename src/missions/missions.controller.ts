import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { MissionsService } from './missions.service';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  findAll() {
    return this.missionsService.findAll();
  }

  @Get('driver/:driverId/all')
  findAllByDriver(@Param('driverId') driverId: string) {
    return this.missionsService.findAllByDriver(Number(driverId));
  }

  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string) {
    return this.missionsService.findByDriver(Number(driverId));
  }

  @Get('client/:clientId/all')
  findAllByClient(@Param('clientId') clientId: string) {
    return this.missionsService.findAllByClient(Number(clientId));
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.missionsService.findByClient(Number(clientId));
  }

  @Post()
  create(
    @Body()
    body: {
      clientId: number;
      pickup: string;
      destination: string;
      pickupLat: number;
      pickupLng: number;
      destinationLat: number;
      destinationLng: number;
      price: number;
      vehicleType?: string;
      driverId?: number;
    },
  ) {
    return this.missionsService.create(
      Number(body.clientId),
      body.pickup,
      body.destination,
      Number(body.pickupLat),
      Number(body.pickupLng),
      Number(body.destinationLat),
      Number(body.destinationLng),
      Number(body.price),
      body.vehicleType,
      body.driverId !== undefined && body.driverId !== null
        ? Number(body.driverId)
        : undefined,
    );
  }

  @Patch(':id/driver')
  assignDriver(
    @Param('id') id: string,
    @Body() body: { driverId: number },
  ) {
    return this.missionsService.assignDriver(
      Number(id),
      Number(body.driverId),
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.missionsService.updateStatus(Number(id), body.status);
  }
}