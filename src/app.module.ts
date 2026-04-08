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
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'maliba22',
      database: 'supergo',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
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