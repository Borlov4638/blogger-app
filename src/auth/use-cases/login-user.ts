import { Injectable, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from './session-use-cases/create-session';
import { UsersRepository } from 'src/users/users.repository';
import { CryptoService } from 'src/crypto/crypto.service';
import { JwtService } from '@nestjs/jwt';

interface ILoginUser {
  loginOrEmail: string;
  password: string;
}

interface ILoginUser {
  loginOrEmail: string;
  password: string;
}

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}

export class LoginUserCommand {
  constructor(public credentials: ILoginUser, public request: Request) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JwtService,
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: LoginUserCommand) {
    const user = await this.checkCredentials(command.credentials);
    const reftrsTokenExpDate = 20;
    const deviceId = uuidv4();
    const accessToken = await this.getUsersAccessToken(user, 10);
    const refreshToken = await this.getUsersRefreshToken(
      user,
      reftrsTokenExpDate,
      deviceId,
    );
    const refreshHash = refreshToken.split('.')[2];

    await this.commandBus.execute(
      new CreateSessionCommand(
        command.request,
        user,
        reftrsTokenExpDate,
        deviceId,
        refreshHash,
      ),
    );
    return { accessToken, refreshToken };
  }
  async checkCredentials(credentials: ILoginUser) {
    const user = await this.usersRepo.getUserByLoginOrEmail(
      credentials.loginOrEmail,
    );

    if (!user) {
      throw new UnauthorizedException();
    }
    const isUserValid = await this.cryptoService.validateHash(
      credentials.password,
      user.password,
    );

    if (!isUserValid) {
      throw new UnauthorizedException();
    }
    return user;
  }
  async getUsersAccessToken(user: IUsersAcessToken, exp: number | string) {
    return await this.jwtService.signAsync(
      { id: user.id, email: user.email, login: user.login },
      { expiresIn: exp },
    );
  }
  async getUsersRefreshToken(
    user: IUsersAcessToken,
    exp: number | string,
    deviceId: string,
  ) {
    return await this.jwtService.signAsync(
      { id: user.id, email: user.email, login: user.login, deviceId: deviceId },
      { expiresIn: exp },
    );
  }
}
