import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
  ) {}

  findAll() {
    return this.driversRepository.find({
      select: ['id', 'name', 'phone', 'vehicleType', 'lat', 'lng'],
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = this.driversRepository.create({
      name,
      phone,
      password: hashedPassword,
      vehicleType: vehicleType ?? 'taxi',
      lat: 12.6392,
      lng: -8.0029,
    });

    const savedDriver = await this.driversRepository.save(driver);

    return {
      id: savedDriver.id,
      name: savedDriver.name,
      phone: savedDriver.phone,
      vehicleType: savedDriver.vehicleType,
      lat: savedDriver.lat,
      lng: savedDriver.lng,
    };
  }

  async login(phone: string, password: string) {
    const driver = await this.driversRepository.findOne({
      where: { phone },
    });

    if (!driver) {
      return { error: 'Téléphone ou mot de passe incorrect' };
    }

    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
      return { error: 'Téléphone ou mot de passe incorrect' };
    }

    return {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      lat: driver.lat,
      lng: driver.lng,
    };
  }

  async create(name: string, phone?: string, vehicleType?: string) {
    const hashedPassword = await bcrypt.hash('1234', 10);

    const driver = this.driversRepository.create({
      name,
      phone: phone ?? '',
      password: hashedPassword,
      vehicleType: vehicleType ?? 'taxi',
      lat: 12.6392,
      lng: -8.0029,
    });

    const savedDriver = await this.driversRepository.save(driver);

    return {
      id: savedDriver.id,
      name: savedDriver.name,
      phone: savedDriver.phone,
      vehicleType: savedDriver.vehicleType,
      lat: savedDriver.lat,
      lng: savedDriver.lng,
    };
  }

  async updateLocation(id: number, lat: number, lng: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    driver.lat = lat;
    driver.lng = lng;

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      name: updatedDriver.name,
      phone: updatedDriver.phone,
      vehicleType: updatedDriver.vehicleType,
      lat: updatedDriver.lat,
      lng: updatedDriver.lng,
    };
  }
}