import { Body, Controller, Get, Post, HttpCode } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Post('register')
  register(
    @Body()
    body: {
      name: string;
      phone: string;
      password: string;
    },
  ) {
    return this.clientsService.register(
      body.name,
      body.phone,
      body.password,
    );
  }

  @Post('login')
  @HttpCode(200)
  login(
    @Body()
    body: {
      phone: string;
      password: string;
    },
  ) {
    return this.clientsService.login(
      body.phone,
      body.password,
    );
  }
}