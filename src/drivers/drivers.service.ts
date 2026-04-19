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
        'isApproved',
        'isBlocked',
        'profilePhoto',
        'identityPhoto',
        'licensePhoto',
        'vehiclePhoto',
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
        'isApproved',
        'isBlocked',
        'profilePhoto',
        'identityPhoto',
        'licensePhoto',
        'vehiclePhoto',
        'lastSeen',
      ],
      where: {
        isActive: true,
        isApproved: true,
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
        'isApproved',
        'isBlocked',
        'profilePhoto',
        'identityPhoto',
        'licensePhoto',
        'vehiclePhoto',
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
    profilePhoto?: string | null,
    identityPhoto?: string | null,
    licensePhoto?: string | null,
    vehiclePhoto?: string | null,
  ) {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanVehicleType =
      vehicleType?.trim().toLowerCase() === 'moto' ? 'moto' : 'taxi';

    if (!cleanName) {
      return { error: 'Le nom est obligatoire' };
    }

    if (!cleanPhone) {
      return { error: 'Le téléphone est obligatoire' };
    }

    if (!password || password.trim().length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    const existingDriver = await this.driversRepository.findOne({
      where: { phone: cleanPhone },
    });

    if (existingDriver) {
      return { error: 'Téléphone déjà utilisé' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = this.driversRepository.create({
      name: cleanName,
      phone: cleanPhone,
      password: hashedPassword,
      vehicleType: cleanVehicleType,
      lat: 12.6392,
      lng: -8.0029,
      heading: 0,
      isActive: false,
      isApproved: false,
      isBlocked: false,
      profilePhoto: profilePhoto ?? null,
      identityPhoto: identityPhoto ?? null,
      licensePhoto: licensePhoto ?? null,
      vehiclePhoto: vehiclePhoto ?? null,
      lastSeen: null,
    });

    const savedDriver = await this.driversRepository.save(driver);

    return {
      id: savedDriver.id,
      name: savedDriver.name,
      phone: savedDriver.phone,
      vehicleType: savedDriver.vehicleType,
      profilePhoto: savedDriver.profilePhoto,
      identityPhoto: savedDriver.identityPhoto,
      licensePhoto: savedDriver.licensePhoto,
      vehiclePhoto: savedDriver.vehiclePhoto,
      isActive: savedDriver.isActive,
      isApproved: savedDriver.isApproved,
      isBlocked: savedDriver.isBlocked,
      message: 'Compte chauffeur créé. En attente de validation.',
    };
  }

  async login(phone: string, password: string) {
    const driver = await this.driversRepository.findOne({
      where: { phone: phone.trim() },
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

    if (!driver.isApproved) {
      return { error: 'Votre compte chauffeur est en attente de validation' };
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
      isApproved: updatedDriver.isApproved,
      isBlocked: updatedDriver.isBlocked,
      profilePhoto: updatedDriver.profilePhoto,
      identityPhoto: updatedDriver.identityPhoto,
      licensePhoto: updatedDriver.licensePhoto,
      vehiclePhoto: updatedDriver.vehiclePhoto,
      lastSeen: updatedDriver.lastSeen,
    };
  }

  async create(name: string, phone?: string, vehicleType?: string) {
    const cleanPhone = (phone ?? '').trim();

    if (cleanPhone) {
      const existingDriver = await this.driversRepository.findOne({
        where: { phone: cleanPhone },
      });

      if (existingDriver) {
        return { error: 'Téléphone déjà utilisé' };
      }
    }

    const hashedPassword = await bcrypt.hash('1234', 10);

    const driver = this.driversRepository.create({
      name: name.trim(),
      phone: cleanPhone,
      password: hashedPassword,
      vehicleType: vehicleType?.trim().toLowerCase() === 'moto' ? 'moto' : 'taxi',
      lat: 12.6392,
      lng: -8.0029,
      heading: 0,
      isActive: false,
      isApproved: true,
      isBlocked: false,
      profilePhoto: null,
      identityPhoto: null,
      licensePhoto: null,
      vehiclePhoto: null,
      lastSeen: null,
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
      isApproved: savedDriver.isApproved,
      isBlocked: savedDriver.isBlocked,
      profilePhoto: savedDriver.profilePhoto,
      identityPhoto: savedDriver.identityPhoto,
      licensePhoto: savedDriver.licensePhoto,
      vehiclePhoto: savedDriver.vehiclePhoto,
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

    if (!driver.isApproved) {
      return { error: 'Compte chauffeur non validé' };
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
      isApproved: updatedDriver.isApproved,
      isBlocked: updatedDriver.isBlocked,
      profilePhoto: updatedDriver.profilePhoto,
      identityPhoto: updatedDriver.identityPhoto,
      licensePhoto: updatedDriver.licensePhoto,
      vehiclePhoto: updatedDriver.vehiclePhoto,
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

    if (!driver.isApproved) {
      return { error: 'Votre compte chauffeur est en attente de validation' };
    }

    driver.isActive = true;
    driver.lastSeen = new Date();

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      isActive: updatedDriver.isActive,
      isApproved: updatedDriver.isApproved,
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
      isApproved: updatedDriver.isApproved,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }

  async approveDriver(id: number) {
    const driver = await this.driversRepository.findOne({
      where: { id },
    });

    if (!driver) {
      return { error: 'Chauffeur introuvable' };
    }

    driver.isApproved = true;

    const updatedDriver = await this.driversRepository.save(driver);

    return {
      id: updatedDriver.id,
      isActive: updatedDriver.isActive,
      isApproved: updatedDriver.isApproved,
      isBlocked: updatedDriver.isBlocked,
      profilePhoto: updatedDriver.profilePhoto,
      identityPhoto: updatedDriver.identityPhoto,
      licensePhoto: updatedDriver.licensePhoto,
      vehiclePhoto: updatedDriver.vehiclePhoto,
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
      isApproved: updatedDriver.isApproved,
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
      isApproved: updatedDriver.isApproved,
      isBlocked: updatedDriver.isBlocked,
      lastSeen: updatedDriver.lastSeen,
    };
  }
}