import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  private settings = {
    appName: 'SuperGo',
    logoUrl: '',
  };

  getSettings() {
    return this.settings;
  }

  updateSettings(data: { appName?: string; logoUrl?: string }) {
    this.settings = {
      ...this.settings,
      ...data,
    };

    return this.settings;
  }
}