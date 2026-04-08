import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(
    @Body() body: { appName?: string; logoUrl?: string },
  ) {
    return this.settingsService.updateSettings(body);
  }
}