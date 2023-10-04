import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class BearerAccessAuthGuard implements CanActivate {
    constructor(private jwtService : JwtService){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request : Request = context.switchToHttp().getRequest()

        if(!request.headers.authorization){
            throw new UnauthorizedException()
        }
        const token = request.headers.authorization.split(' ')[1]
        if(!token){
            throw new UnauthorizedException()
        }
        try{
            this.jwtService.verify(token)
        }catch{
            throw new UnauthorizedException()
        }
        return true;
    }

}

@Injectable()
export class BearerRefreshAuthGuard implements CanActivate {
    constructor(private jwtService : JwtService){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request : Request = context.switchToHttp().getRequest()
        const token = request.cookies.refreshToken
        if(!token){
            throw new UnauthorizedException()
        }
        try{
            this.jwtService.verify(token)
        }catch{
            throw new UnauthorizedException()
        }
        return true;
    }

}