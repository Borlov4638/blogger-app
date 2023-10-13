import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CrytoModule } from '../crypto/crypto.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { SessionService } from './sessions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, sessionSchema } from '../entyties/session.schema';
import { GetMyUsersDataUseCase } from './use-cases/get-my-users-data';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateSessionUseCase } from './use-cases/session-use-cases/create-session';
import { RefreshCurrentSessionUseCase } from './use-cases/session-use-cases/refresh-current-session';
import { LoginUserUseCase } from './use-cases/login-user';
import { SessionRepository } from './session.repository';
import { ValidateSessionUseCase } from './use-cases/session-use-cases/validate -session';
import { GetNewTokenPairUseCase } from './use-cases/get-new-token-pare';
import { RegistrateUserUseCase } from './use-cases/registrate-user';
import { ConfirmRegistartionUseCase } from './use-cases/confirm-registration';
import { ResendEmailUseCase } from './use-cases/resend-confirmation-email';
import { SendPassRecoveryCodeUseCase } from './use-cases/send-password-rec-code';
import { RecoverPasswordUseCase } from './use-cases/recover-password';
import { DeleteCurrenSessionUseCase } from './use-cases/session-use-cases/delete-current-session';

const UseCases = [DeleteCurrenSessionUseCase, RecoverPasswordUseCase, SendPassRecoveryCodeUseCase, ResendEmailUseCase, ConfirmRegistartionUseCase, RegistrateUserUseCase, GetMyUsersDataUseCase, LoginUserUseCase, CreateSessionUseCase, RefreshCurrentSessionUseCase, ValidateSessionUseCase, GetNewTokenPairUseCase]


@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionService, ...UseCases, SessionRepository],
  imports: [
    CrytoModule,
    UsersModule,
    JwtModule.register({
      secret: 'dhcfgvhbjnkmjbhvgjfgfcjhvkbljnknjbhvghjg',
      global: true,
    }),
    MongooseModule.forFeature([{ name: Session.name, schema: sessionSchema }]),
    CqrsModule
  ],
  exports: [SessionRepository, SessionService],
})
export class AuthModule { }
