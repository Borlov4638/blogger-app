import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CrytoModule } from '../crypto/crypto.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
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
import { SessionRepositoryPg } from './session.repository-orm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionPg } from './enities/session.entitie';

const UseCases = [
  DeleteCurrenSessionUseCase,
  RecoverPasswordUseCase,
  SendPassRecoveryCodeUseCase,
  ResendEmailUseCase,
  ConfirmRegistartionUseCase,
  RegistrateUserUseCase,
  GetMyUsersDataUseCase,
  LoginUserUseCase,
  CreateSessionUseCase,
  RefreshCurrentSessionUseCase,
  ValidateSessionUseCase,
  GetNewTokenPairUseCase,
];


let providers = []
let exporters = []
let imporst = []
if (process.env.DATABASE === 'mongo') {
  providers = [SessionRepository]
  exporters = [SessionRepository]
  imporst = [MongooseModule.forFeature([{ name: Session.name, schema: sessionSchema }])]
} else if (process.env.DATABASE === 'postgres') {
  imporst = [TypeOrmModule.forFeature([SessionPg])]
  providers = [SessionRepositoryPg]
  exporters = [SessionRepositoryPg]
}

@Global()
@Module({
  controllers: [AuthController],
  providers: [...UseCases, ...providers],
  imports: [
    CrytoModule,
    UsersModule,
    ...imporst,
    CqrsModule,
  ],
  exports: [...exporters],
})
export class AuthModule { }
