import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { Driver } from './driver.entity';
import { DriversGateway } from './drivers.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],

  controllers: [DriversController],

  providers: [
    DriversService,
    DriversGateway, // ✅ IMPORTANT POUR WEBSOCKET
  ],
})
export class DriversModule {}