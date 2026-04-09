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
    return this.clientsRepository.find({
      select: ['id', 'name', 'phone'],
    });
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

    const savedClient = await this.clientsRepository.save(client);

    return {
      id: savedClient.id,
      name: savedClient.name,
      phone: savedClient.phone,
    };
  }

  async login(phone: string, password: string) {
    const client = await this.clientsRepository.findOne({
      where: { phone, password },
    });

    if (!client) {
      return { error: 'Téléphone ou mot de passe incorrect' };
    }

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
    };
  }
}