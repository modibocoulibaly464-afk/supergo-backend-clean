import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  private settings = {
    appName: 'SuperGo',
    logoUrl: 'http://192.168.0.17:3001/uploads/logo.png',
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