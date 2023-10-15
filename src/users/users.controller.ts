import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, UsersPaganationQuery } from './dto/users.dto';
import { BasicAuthGuard } from '../auth/guards/auth.basic.guard';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllUsersCommand } from './use-cases/get-all-users';
import { CreateUserCommand } from './use-cases/create-user';
import { DeleteUserByIdCommand } from './use-cases/delete-user-by-id';

@Controller('sa/users')
export class UsersController {
  constructor(private commandBus: CommandBus) { }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllUsers(@Query() paganation: UsersPaganationQuery) {
    return await this.commandBus.execute(new GetAllUsersCommand(paganation));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() data: CreateUserDto) {
    return await this.commandBus.execute(new CreateUserCommand(data, true));
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteUserByIdCommand(id));
  }
}
