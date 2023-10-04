import { Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { SessionService } from "../auth/sessions.service";

interface IUsersRefreshToken{
    id:string
    email:string
    login:string
    deviceId:string
}

@Injectable()
export class SecDevService{
    constructor(private readonly sessionService :SessionService, private jwtService :JwtService){}
    async getUserDevices(request:Request){
        return await this.sessionService.getUserSessions(request);
    }
    async deleteSessionById(id:string){
        const session =  await this.sessionService.deleteSessionById(id)
        if(!session){
            throw new NotFoundException()
        }
        return
    }
}