import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from './mission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission])],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}