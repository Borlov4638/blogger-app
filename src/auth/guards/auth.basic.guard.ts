import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException('no credentials has been passed');
    }
    if (request.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
      throw new UnauthorizedException('invalid credential');
    }

    return true;
  }
}
