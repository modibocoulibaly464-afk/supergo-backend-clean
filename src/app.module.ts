import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DriversModule } from './drivers/drivers.module';
import { MissionsModule } from './missions/missions.module';
import { ClientsModule } from './clients/clients.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres:SsHaGAgzyWYGRbhFBbeQkSkLYdYeVedC@mainline.proxy.rlwy.net:38748/railway',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    DriversModule,
    MissionsModule,
    ClientsModule,
    SettingsModule,
  ],
})
export class AppModule {}