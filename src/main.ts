import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3000, '0.0.0.0');
  console.log('Serveur lancé sur http://localhost:3000');
}
bootstrap();