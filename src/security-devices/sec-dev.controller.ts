import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BearerRefreshAuthGuard } from '../auth/guards/auth.bearer.guard';
import { SecDevService } from './sec-dev.service';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateSessionCommand } from '../auth/use-cases/session-use-cases/validate -session';

@Controller('security')
export class SecDevController {
  constructor(
    private commandBus: CommandBus,
    private readonly secDevService: SecDevService,
  ) {}

  @UseGuards(BearerRefreshAuthGuard)
  @Get('devices')
  async getUserDevices(@Req() request: Request) {
    await this.commandBus.execute(new ValidateSessionCommand(request));
    return await this.secDevService.getUserDevices(request);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerRefreshAuthGuard)
  @Delete('devices')
  async deleteOtherSessions(@Req() request: Request) {
    await this.commandBus.execute(new ValidateSessionCommand(request));
    return await this.secDevService.deleteOtherSessions(request);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerRefreshAuthGuard)
  @Delete('devices/:id')
  async deleteSessionById(@Req() request: Request, @Param('id') id: string) {
    await this.commandBus.execute(new ValidateSessionCommand(request));
    await this.secDevService.deleteSessionById(request, id);
  }
}
