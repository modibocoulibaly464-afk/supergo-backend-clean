import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './mission.entity';

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function roundUpTo500(value: number) {
  return Math.ceil(value / 500) * 500;
}

function calculateMotoPrice(distanceKm: number) {
  const km = Math.ceil(distanceKm);

  if (km <= 2) return 500;
  if (km <= 5) return 1000;
  if (km === 6) return 1500;
  if (km <= 8) return 2000;
  if (km <= 10) return 2500;
  if (km <= 12) return 3000;
  if (km <= 15) return 3500;
  if (km <= 17) return 4000;
  if (km <= 22) return 5000;

  return 5000 + (km - 22) * 500;
}

function calculateTripPrice(distanceKm: number, vehicleType?: string) {
  const finalVehicleType = (vehicleType ?? 'taxi').trim().toLowerCase();
  const motoPrice = calculateMotoPrice(distanceKm);

  if (finalVehicleType === 'moto') {
    return motoPrice;
  }

  const taxiRaw = Math.round(motoPrice * 1.25);
  return roundUpTo500(taxiRaw);
}

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
  ) {}

  async findAll() {
    return this.missionsRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findByDriver(driverId: number) {
    return this.missionsRepository
      .createQueryBuilder('mission')
      .where('mission.driverId = :driverId', { driverId })
      .andWhere('mission.status IN (:...statuses)', {
        statuses: ['assigned', 'accepted', 'arrived', 'started'],
      })
      .orderBy('mission.id', 'DESC')
      .getMany();
  }

  async findAllByDriver(driverId: number) {
    return this.missionsRepository.find({
      where: { driverId },
      order: { id: 'DESC' },
    });
  }

  async findByClient(clientId: number) {
    return this.missionsRepository
      .createQueryBuilder('mission')
      .where('mission.clientId = :clientId', { clientId })
      .andWhere('mission.status IN (:...statuses)', {
        statuses: ['pending', 'assigned', 'accepted', 'arrived', 'started'],
      })
      .orderBy('mission.id', 'DESC')
      .getOne();
  }

  async findAllByClient(clientId: number) {
    return this.missionsRepository.find({
      where: { clientId },
      order: { id: 'DESC' },
    });
  }

  async create(
    clientId: number,
    pickup: string,
    destination: string,
    pickupLat: number,
    pickupLng: number,
    destinationLat: number,
    destinationLng: number,
    _price: number,
    vehicleType?: string,
    driverId?: number,
  ) {
    const finalVehicleType = vehicleType ?? 'taxi';

    const existingActiveMission = await this.missionsRepository
      .createQueryBuilder('mission')
      .where('mission.clientId = :clientId', { clientId })
      .andWhere('mission.status IN (:...statuses)', {
        statuses: ['pending', 'assigned', 'accepted', 'arrived', 'started'],
      })
      .orderBy('mission.id', 'DESC')
      .getOne();

    if (existingActiveMission) {
      return {
        error: 'Une mission active existe déjà',
        mission: existingActiveMission,
      };
    }

    const tripDistanceKm = calculateDistance(
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng,
    );

    const finalPrice = calculateTripPrice(tripDistanceKm, finalVehicleType);

    let assignedDriverId: number | null = null;
    let missionStatus = 'pending';

    if (driverId !== undefined && driverId !== null) {
      const existingDriverMission = await this.missionsRepository
        .createQueryBuilder('mission')
        .where('mission.driverId = :driverId', { driverId })
        .andWhere('mission.status IN (:...statuses)', {
          statuses: ['assigned', 'accepted', 'arrived', 'started'],
        })
        .getOne();

      if (existingDriverMission) {
        return { error: 'Ce chauffeur est déjà occupé' };
      }

      assignedDriverId = driverId;
      missionStatus = 'assigned';
    } else {
      const busyMissions = await this.missionsRepository
        .createQueryBuilder('mission')
        .select('mission.driverId', 'driverId')
        .where('mission.driverId IS NOT NULL')
        .andWhere('mission.status IN (:...statuses)', {
          statuses: ['assigned', 'accepted', 'arrived', 'started'],
        })
        .getRawMany();

      const busyDriverIds = busyMissions.map((m) => Number(m.driverId));

      const drivers: Array<{
        id: number;
        lat: number | null;
        lng: number | null;
        vehicletype: string | null;
        isactive: boolean;
        isblocked: boolean;
        lastseen: string | null;
      }> = await this.missionsRepository.query(
        `SELECT id, lat, lng, "vehicleType" AS vehicletype, "isActive" AS isactive, "isBlocked" AS isblocked, "lastSeen" AS lastseen FROM driver`,
      );

      const now = Date.now();
      const onlineThresholdMs = 2 * 60 * 1000;

      const availableDrivers = drivers.filter((d) => {
        if (d.lat === null || d.lng === null) return false;
        if ((d.vehicletype ?? 'taxi') !== finalVehicleType) return false;
        if (d.isactive !== true) return false;
        if (d.isblocked === true) return false;
        if (busyDriverIds.includes(d.id)) return false;
        if (!d.lastseen) return false;

        const lastSeenTime = new Date(d.lastseen).getTime();
        if (isNaN(lastSeenTime)) return false;

        return now - lastSeenTime <= onlineThresholdMs;
      });

      if (availableDrivers.length === 0) {
        return {
          error:
            finalVehicleType === 'moto'
              ? 'Aucun Telimani disponible'
              : 'Aucun taxi disponible',
          driverId: null,
          vehicleType: finalVehicleType,
        };
      }

      let nearestDriver = availableDrivers[0];
      let minDistance = calculateDistance(
        pickupLat,
        pickupLng,
        Number(nearestDriver.lat),
        Number(nearestDriver.lng),
      );

      for (const driver of availableDrivers) {
        const distance = calculateDistance(
          pickupLat,
          pickupLng,
          Number(driver.lat),
          Number(driver.lng),
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      }

      assignedDriverId = nearestDriver.id;

      const existingDriverMission = await this.missionsRepository
        .createQueryBuilder('mission')
        .where('mission.driverId = :driverId', { driverId: assignedDriverId })
        .andWhere('mission.status IN (:...statuses)', {
          statuses: ['assigned', 'accepted', 'arrived', 'started'],
        })
        .getOne();

      if (existingDriverMission) {
        return { error: 'Ce chauffeur est déjà occupé' };
      }

      missionStatus = 'assigned';
    }

    const mission = this.missionsRepository.create({
      clientId,
      pickup,
      destination,
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng,
      driverId: assignedDriverId,
      price: finalPrice,
      vehicleType: finalVehicleType,
      status: missionStatus,
    });

    return this.missionsRepository.save(mission);
  }

  async assignDriver(id: number, driverId: number) {
    const mission = await this.missionsRepository.findOne({
      where: { id },
    });

    if (!mission) {
      return { error: 'Mission introuvable' };
    }

    const existingDriverMission = await this.missionsRepository
      .createQueryBuilder('mission')
      .where('mission.driverId = :driverId', { driverId })
      .andWhere('mission.status IN (:...statuses)', {
        statuses: ['assigned', 'accepted', 'arrived', 'started'],
      })
      .andWhere('mission.id != :missionId', { missionId: id })
      .getOne();

    if (existingDriverMission) {
      return { error: 'Ce chauffeur est déjà occupé' };
    }

    mission.driverId = driverId;
    mission.status = 'assigned';

    return this.missionsRepository.save(mission);
  }

  async updateStatus(id: number, status: string) {
    const mission = await this.missionsRepository.findOne({
      where: { id },
    });

    if (!mission) {
      return { error: 'Mission introuvable' };
    }

    mission.status = status;

    return this.missionsRepository.save(mission);
  }
}