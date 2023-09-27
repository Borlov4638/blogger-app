import { Controller, Delete, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Delete('testing/all-data')
  async testingAll(): Promise<void> {
    return await this.appService.deleteAllData();
  }
}
