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
import { AuthRepository } from './auth.repository';
import { SessionRepository } from './session.repository';
import { ValidateSessionUseCase } from './use-cases/session-use-cases/validate -session';
import { GetNewTokenPairUseCase } from './use-cases/get-new-token-pare';
import { RegistrateUserUseCase } from './use-cases/registrate-user';

const UseCases = [RegistrateUserUseCase, GetMyUsersDataUseCase, LoginUserUseCase, CreateSessionUseCase, RefreshCurrentSessionUseCase, ValidateSessionUseCase, GetNewTokenPairUseCase]


@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionService, ...UseCases, AuthRepository, SessionRepository],
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
  exports: [SessionService],
})
export class AuthModule { }
