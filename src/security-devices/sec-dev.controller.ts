import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  BearerRefreshAuthGuard,
} from '../auth/guards/auth.bearer.guard';
import { SecDevService } from './sec-dev.service';
import { SessionService } from '../auth/sessions.service';

@Controller('security')
export class SecDevController {
  constructor(
    private readonly secDevService: SecDevService,
    private readonly sessionService: SessionService,
  ) { }
  @UseGuards(BearerRefreshAuthGuard)
  @Get('devices')
  async getUserDevices(@Req() request: Request) {
    await this.sessionService.validateSession(request);
    return await this.secDevService.getUserDevices(request);
  }

  @UseGuards(BearerRefreshAuthGuard)
  @Delete('devices')
  async deleteOtherSessions(@Req() request: Request) {
    await this.sessionService.validateSession(request);
    return await this.sessionService.deleteOtherSessions(request);
  }
  @UseGuards(BearerRefreshAuthGuard)
  @Delete('devices/:id')
  async deleteSessionById(@Req() request: Request, @Param('id') id: string) {
    await this.sessionService.validateSession(request);
    return await this.secDevService.deleteSessionById(id);
  }
}
