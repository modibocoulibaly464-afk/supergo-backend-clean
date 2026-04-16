import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  HttpCode,
} from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  getDrivers() {
    return this.driversService.findAll();
  }

  @Get('nearby')
  getNearbyDrivers() {
    return this.driversService.findNearbyDrivers();
  }

  @Get(':id')
  getDriver(@Param('id') id: string) {
    return this.driversService.findOne(Number(id));
  }

  @Post()
  createDriver(
    @Body() body: { name: string; phone?: string; vehicleType?: string },
  ) {
    return this.driversService.create(
      body.name,
      body.phone,
      body.vehicleType,
    );
  }

  @Post('register')
  register(
    @Body()
    body: {
      name: string;
      phone: string;
      password: string;
      vehicleType?: string;
    },
  ) {
    return this.driversService.register(
      body.name,
      body.phone,
      body.password,
      body.vehicleType,
    );
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { phone: string; password: string }) {
    return this.driversService.login(body.phone, body.password);
  }

  @Patch(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number; heading?: number },
  ) {
    return this.driversService.updateLocation(
      Number(id),
      Number(body.lat),
      Number(body.lng),
      Number(body.heading ?? 0),
    );
  }

  @Patch(':id/activate')
  activateDriver(@Param('id') id: string) {
    return this.driversService.activateDriver(Number(id));
  }

  @Patch(':id/deactivate')
  deactivateDriver(@Param('id') id: string) {
    return this.driversService.deactivateDriver(Number(id));
  }

  @Patch(':id/block')
  blockDriver(@Param('id') id: string) {
    return this.driversService.blockDriver(Number(id));
  }

  @Patch(':id/unblock')
  unblockDriver(@Param('id') id: string) {
    return this.driversService.unblockDriver(Number(id));
  }
}