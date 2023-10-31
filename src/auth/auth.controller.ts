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
  registrationCodeDto,
} from './dto/auth.dto';
import { Request, Response } from 'express';
import {
  BearerAccessAuthGuard,
  BearerRefreshAuthGuard,
} from './guards/auth.bearer.guard';
import { CreateUserDto } from '../users/dto/users.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { GetMyUsersDataCommand } from './use-cases/get-my-users-data';
import { LoginUserCommand } from './use-cases/login-user';
import { ValidateSessionCommand } from './use-cases/session-use-cases/validate -session';
import { GetNewTokenPairCommand } from './use-cases/get-new-token-pare';
import { RegistrateUserCommand } from './use-cases/registrate-user';
import { ConfirmRegistartionCommand } from './use-cases/confirm-registration';
import { ResendEmailCommand } from './use-cases/resend-confirmation-email';
import { SendPassRecoveryCodeCommand } from './use-cases/send-password-rec-code';
import { RecoverPasswordCommand } from './use-cases/recover-password';
import { DeleteCurrenSessionCommand } from './use-cases/session-use-cases/delete-current-session';
import { ThrottlerBehindProxyGuard } from './guards/throttler.behind.proxy';

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async loginUser(
    @Body() credentials: LoginUserDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const tokens: ITokens = await this.commandBus.execute(
      new LoginUserCommand(credentials, request),
    );
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
    const tokens = await this.commandBus.execute(
      new GetNewTokenPairCommand(request),
    );
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return response.status(200).json({ accessToken: tokens.accessToken });
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registrateUser(@Body() data: CreateUserDto) {
    return await this.commandBus.execute(new RegistrateUserCommand(data));
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmRegistration(@Body() data: registrationCodeDto) {
    await this.commandBus.execute(new ConfirmRegistartionCommand(data.code));
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendConfirmationEmail(@Body() data: RegistrationEmailResendingDto) {
    await this.commandBus.execute(new ResendEmailCommand(data.email));
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('password-recovery')
  async sendPasswordRecoveryCode(@Body('email') email: string) {
    await this.commandBus.execute(new SendPassRecoveryCodeCommand(email));
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('new-password')
  async newPassword(@Body() data: PasswordRecoveryDto) {
    await this.commandBus.execute(new RecoverPasswordCommand(data));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerRefreshAuthGuard)
  @Post('logout')
  async logoutUser(@Req() request: Request) {
    await this.commandBus.execute(new ValidateSessionCommand(request));
    await this.commandBus.execute(new DeleteCurrenSessionCommand(request));
  }

  @UseGuards(BearerAccessAuthGuard)
  @Get('me')
  async getMe(@Req() request: Request) {
    return await this.commandBus.execute(new GetMyUsersDataCommand(request));
  }
}
