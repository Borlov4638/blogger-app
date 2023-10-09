import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  startingPage() {
    return "project is running"
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('testing/all-data')
  async testingAll(): Promise<void> {
    return await this.appService.deleteAllData();
  }
}
