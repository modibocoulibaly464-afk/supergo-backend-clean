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
    @Body() body: { lat: number; lng: number },
  ) {
    return this.driversService.updateLocation(
      Number(id),
      body.lat,
      body.lng,
    );
  }
}