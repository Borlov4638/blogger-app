import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RefreshCurrentSessionCommand } from './session-use-cases/refresh-current-session';
import { UnauthorizedException } from '@nestjs/common';

interface IUsersAcessToken {
  id: string;
  email: string;
  login: string;
}
interface IUsersRefreshToken {
  id: string;
  email: string;
  login: string;
  deviceId: string;
}

export class GetNewTokenPairCommand {
  constructor(public request: Request) { }
}

@CommandHandler(GetNewTokenPairCommand)
export class GetNewTokenPairUseCase
  implements ICommandHandler<GetNewTokenPairCommand>
{
  constructor(private jwtService: JwtService, private commandBus: CommandBus) { }

  async execute(command: GetNewTokenPairCommand) {
    const data: IUsersRefreshToken = await this.getTokenDataAndVerify(
      command.request.cookies.refreshToken,
    );
    const reftrsTokenExpDate = 2000;
    const accessToken = await this.getUsersAccessToken(data, 400);
    const refreshToken = await this.getUsersRefreshToken(
      data,
      reftrsTokenExpDate,
      data.deviceId,
    );
    const refreshHash = refreshToken.split('.')[2];
    await this.commandBus.execute(
      new RefreshCurrentSessionCommand(
        command.request,
        reftrsTokenExpDate,
        data.deviceId,
        refreshHash,
      ),
    );
    return { accessToken, refreshToken };
  }

  private async getUsersAccessToken(
    user: IUsersAcessToken,
    exp: number | string,
  ) {
    return await this.jwtService.signAsync(
      { id: user.id, email: user.email, login: user.login },
      { expiresIn: exp },
    );
  }

  private async getUsersRefreshToken(
    user: IUsersAcessToken,
    exp: number | string,
    deviceId: string,
  ) {
    return await this.jwtService.signAsync(
      { id: user.id, email: user.email, login: user.login, deviceId: deviceId },
      { expiresIn: exp },
    );
  }

  private async getTokenDataAndVerify(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
