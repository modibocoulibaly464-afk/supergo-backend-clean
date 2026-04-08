import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  findAll() {
    return this.clientsRepository.find();
  }

  async register(name: string, phone: string, password: string) {
    const existingClient = await this.clientsRepository.findOne({
      where: { phone },
    });

    if (existingClient) {
      return { error: 'Téléphone déjà utilisé' };
    }

    const client = this.clientsRepository.create({
      name,
      phone,
      password,
    });

    return await this.clientsRepository.save(client);
  }

  async login(phone: string, password: string) {
    const client = await this.clientsRepository.findOne({
      where: { phone, password },
    });

    if (!client) {
      return { error: 'Invalid credentials' };
    }

    return client;
  }
}