import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CrytoModule } from '../crypto/crypto.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, usersSchema } from '../entyties/users.chema';
import { UsersRepository } from './users.repository';
import { GetAllUsersUseCase } from './use-cases/get-all-users';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './use-cases/create-user';
import { DeleteUserByIdCommand } from './use-cases/delete-user-by-id';

const useCases = [GetAllUsersUseCase, CreateUserUseCase, DeleteUserByIdCommand];

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, ...useCases],
  imports: [
    CrytoModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: usersSchema }]),
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
