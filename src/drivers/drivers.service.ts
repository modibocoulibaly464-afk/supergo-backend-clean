import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
  ) {}

  findAll() {
    return this.driversRepository.find({
      order: { id: 'DESC' },
    });
  }

  async register(
    name: string,
    phone: string,
    password: string,
    vehicleType?: string,
  ) {
    const existingDriver = await this.driversRepository.findOne({
      where: { phone },
    });

    if (existingDriver) {
      return { error: 'Téléphone déjà utilisé' };
    }

    const driver = this.driversRepository.create({
      name,
      phone,
      password,
      vehicleType: vehicleType ?? 'taxi',
      lat: 12.6392,
      lng: -8.0029,
    });

    return await this.driversRepository.save(driver);
  }

  async login(phone: string, password: string) {
    const driver = await this.driversRepository.findOne({
      where: { phone, password },
    });

    if (!driver) {
      return { error: 'Téléphone ou mot de passe incorrect' };
    }

    return driver;
  }

  async create(name: string, phone?: string, vehicleType?: string) {
    const driver = this.driversRepository.create({
      name,
      phone: phone ?? '',
      password: '1234',
      vehicleType: vehicleType ?? 'taxi',
      lat: 12.6392,
      lng: -8.0029,
    });

    return await this.driversRepository.save(driver);
  }

  async updateLocation(id: number, lat: number, lng: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Driver not found' };
    }

    driver.lat = lat;
    driver.lng = lng;

    return await this.driversRepository.save(driver);
  }
}