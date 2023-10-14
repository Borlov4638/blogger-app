import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CrytoModule } from '../crypto/crypto.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, usersSchema } from '../entyties/users.chema';
import { GetAllUsersUseCase } from './use-cases/get-all-users';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './use-cases/create-user';
import { UsersRepository } from './users.repository-pg';
import { DeleteUserByIdUseCase } from './use-cases/delete-user-by-id';

const useCases = [GetAllUsersUseCase, CreateUserUseCase, DeleteUserByIdUseCase];
let imporst = []
let exporst = []
let providers = []
if (process.env.DATABASE === 'mongo') {
  imporst = [MongooseModule.forFeature([{ name: User.name, schema: usersSchema }])]
  exporst = [UsersRepository]
  providers = [UsersRepository]
} else if (process.env.DATABASE === 'postgres') {

}


@Module({
  controllers: [UsersController],
  providers: [...providers,
  ...useCases, UsersRepository
  ],
  imports: [
    CrytoModule,
    CqrsModule,
    ...imporst,
  ],
  exports: [...exporst],
})
export class UsersModule { }
