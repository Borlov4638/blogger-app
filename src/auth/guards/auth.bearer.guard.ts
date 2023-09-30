import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthBearerGuard implements CanActivate {
    constructor(private jwtService : JwtService){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request : Request = context.switchToHttp().getRequest()
        const token = request.headers.authorization.split(' ')[1]
        if(!token){
            throw new UnauthorizedException()
        }
        try{
            const tokenIsValid = this.jwtService.verify(token)
            if(!tokenIsValid){
                throw new UnauthorizedException()
            }
    
        }catch(err){
            throw new UnauthorizedException()
        }
        return true;
    }

}