import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  LoginUserDto,
  PasswordRecoveryDto,
  RegistrationEmailResendingDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import {
  BearerAccessAuthGuard,
  BearerRefreshAuthGuard,
} from './guards/auth.bearer.guard';
import { CreateUserDto } from '../users/dto/users.dto';
import { SessionService } from './sessions.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { GetMyUsersDataCommand } from './use-cases/get-my-users-data';
import { LoginUserCommand } from './use-cases/login-user';
import { ValidateSessionCommand } from './use-cases/session-use-cases/validate -session';
import { GetNewTokenPairCommand } from './use-cases/get-new-token-pare';

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) { }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async loginUser(
    @Body() credentials: LoginUserDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const tokens: ITokens = await this.commandBus.execute(new LoginUserCommand(
      credentials,
      request,
    ))
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return response.status(200).json({ accessToken: tokens.accessToken });
  }

  @UseGuards(BearerRefreshAuthGuard)
  @Post('refresh-token')
  async getNewTokenPair(@Req() request: Request, @Res() response: Response) {
    await this.commandBus.execute(new ValidateSessionCommand(request));
    const tokens = await this.commandBus.execute(new GetNewTokenPairCommand(request));
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return response.status(200).json({ accessToken: tokens.accessToken });
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registrateUser(@Body() data: CreateUserDto) {
    return await this.authService.registrateUser(data);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmRegistration(@Body('code') token: string) {
    await this.authService.confirmRegistration(token);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendConfirmationEmail(@Body() data: RegistrationEmailResendingDto) {
    await this.authService.resendConfirmationEmail(data.email);
  }

  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  async sendPasswordRecoveryCode(@Body('email') email: string) {
    await this.authService.sendPasswordRecoveryCode(email);
  }

  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  async newPassword(@Body() data: PasswordRecoveryDto) {
    await this.authService.recoverPassword(data);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerRefreshAuthGuard)
  @Post('logout')
  async logoutUser(@Req() request: Request) {
    await this.sessionService.validateSession(request);
    await this.sessionService.deleteCurrentSession(request);
  }

  @UseGuards(BearerAccessAuthGuard)
  @Get('me')
  async getMe(@Req() request: Request) {
    return await this.commandBus.execute(new GetMyUsersDataCommand(request))
  }
}
