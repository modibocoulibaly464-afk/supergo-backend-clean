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
      select: [
        'id',
        'name',
        'phone',
        'vehicleType',
        'lat',
        'lng',
        'heading',
        'isActive',
        'isBlocked',
        'lastSeen',
      ],
      order: { id: 'DESC' },
    });
  }

  async findNearbyDrivers() {
    return this.driversRepository.find({
      select: [
        'id',
        'name',
        'phone',
        'vehicleType',
        'lat',
        'lng',
        'heading',
        'isActive',
        'isBlocked',
        'lastSeen',
      ],
      where: {
        isActive: true,
        isBlocked: false,
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'phone',
        'vehicleType',
        'lat',
        'lng',
        'heading',
        'isActive',
        'isBlocked',
        'lastSeen',
      ],
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    return driver;
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
      heading: 0,
      isActive: true,
      isBlocked: false,
      lastSeen: new Date(),
    });

    const savedDriver = await this.driversRepository.save(driver);

    return {
      id: savedDriver.id,
      name: savedDriver.name,
      phone: savedDriver.phone,
      vehicleType: savedDriver.vehicleType,
      lat: savedDriver.lat,
      lng: savedDriver.lng,
      heading: savedDriver.heading,
      isActive: savedDriver.isActive,
      isBlocked: savedDriver.isBlocked,
      lastSeen: savedDriver.lastSeen,
    };
  }

  async login(phone: string, password: string) {
    const driver = await this.driversRepository.findOne({
      where: { phone },
    });

    if (!driver) {
      return { error: 'Téléphone ou mot de passe incorrect' };
    }

    if (driver.isBlocked) {
      return { error: 'Ce chauffeur est bloqué' };
    }

    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
      return { error: 'Téléphone ou mot de passe incorrect' };
    }

    driver.lastSeen = new Date();
    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      name: updatedDriver.name,
      phone: updatedDriver.phone,
      vehicleType: updatedDriver.vehicleType,
      lat: updatedDriver.lat,
      lng: updatedDriver.lng,
      heading: updatedDriver.heading,
      isActive: updatedDriver.isActive,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
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
      heading: 0,
      isActive: true,
      isBlocked: false,
      lastSeen: new Date(),
    });

    const savedDriver = await this.driversRepository.save(driver);

    return {
      id: savedDriver.id,
      name: savedDriver.name,
      phone: savedDriver.phone,
      vehicleType: savedDriver.vehicleType,
      lat: savedDriver.lat,
      lng: savedDriver.lng,
      heading: savedDriver.heading,
      isActive: savedDriver.isActive,
      isBlocked: savedDriver.isBlocked,
      lastSeen: savedDriver.lastSeen,
    };
  }

  async updateLocation(
    id: number,
    lat: number,
    lng: number,
    heading?: number,
  ) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    if (driver.isBlocked) {
      return { error: 'Ce chauffeur est bloqué' };
    }

    driver.lat = lat;
    driver.lng = lng;
    driver.heading = heading ?? 0;
    driver.lastSeen = new Date();

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      name: updatedDriver.name,
      phone: updatedDriver.phone,
      vehicleType: updatedDriver.vehicleType,
      lat: updatedDriver.lat,
      lng: updatedDriver.lng,
      heading: updatedDriver.heading,
      isActive: updatedDriver.isActive,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }

  async activateDriver(id: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    if (driver.isBlocked) {
      return { error: 'Impossible d’activer un chauffeur bloqué' };
    }

    driver.isActive = true;
    driver.lastSeen = new Date();

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      isActive: updatedDriver.isActive,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }

  async deactivateDriver(id: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    driver.isActive = false;

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      isActive: updatedDriver.isActive,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }

  async blockDriver(id: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    driver.isBlocked = true;
    driver.isActive = false;

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      isActive: updatedDriver.isActive,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }

  async unblockDriver(id: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    driver.isBlocked = false;

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      isActive: updatedDriver.isActive,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }
}