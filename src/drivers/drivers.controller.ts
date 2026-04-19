import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DriversService } from './drivers.service';

function editFileName(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  callback(null, `driver-${uniqueSuffix}${ext}`);
}

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  getDrivers() {
    return this.driversService.findAll();
  }

  @Get('nearby')
  getNearbyDrivers() {
    return this.driversService.findNearbyDrivers();
  }

  @Get(':id')
  getDriver(@Param('id') id: string) {
    return this.driversService.findOne(Number(id));
  }

  @Post()
  createDriver(
    @Body('name') name: string,
    @Body('phone') phone?: string,
    @Body('vehicleType') vehicleType?: string,
  ) {
    return this.driversService.create(
      name,
      phone,
      vehicleType,
    );
  }

  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'identityPhoto', maxCount: 1 },
        { name: 'licensePhoto', maxCount: 1 },
        { name: 'vehiclePhoto', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
      },
    ),
  )
  register(
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      identityPhoto?: Express.Multer.File[];
      licensePhoto?: Express.Multer.File[];
      vehiclePhoto?: Express.Multer.File[];
    },
    @Body('name') name: string,
    @Body('phone') phone: string,
    @Body('password') password: string,
    @Body('vehicleType') vehicleType?: string,
  ) {
    return this.driversService.register(
      name,
      phone,
      password,
      vehicleType,
      files?.profilePhoto?.[0]?.filename ?? null,
      files?.identityPhoto?.[0]?.filename ?? null,
      files?.licensePhoto?.[0]?.filename ?? null,
      files?.vehiclePhoto?.[0]?.filename ?? null,
    );
  }

  @Post('login')
  @HttpCode(200)
  login(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    return this.driversService.login(phone, password);
  }

  @Patch(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
    @Body('heading') heading?: number,
  ) {
    return this.driversService.updateLocation(
      Number(id),
      Number(lat),
      Number(lng),
      Number(heading ?? 0),
    );
  }

  @Patch(':id/activate')
  activateDriver(@Param('id') id: string) {
    return this.driversService.activateDriver(Number(id));
  }

  @Patch(':id/deactivate')
  deactivateDriver(@Param('id') id: string) {
    return this.driversService.deactivateDriver(Number(id));
  }

  @Patch(':id/approve')
  approveDriver(@Param('id') id: string) {
    return this.driversService.approveDriver(Number(id));
  }

  @Patch(':id/block')
  blockDriver(@Param('id') id: string) {
    return this.driversService.blockDriver(Number(id));
  }

  @Patch(':id/unblock')
  unblockDriver(@Param('id') id: string) {
    return this.driversService.unblockDriver(Number(id));
  }
}