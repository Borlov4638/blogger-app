import { Body, Controller, Post, Res } from "@nestjs/common";
import { LoginUserDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { Response } from "express";

interface ITokens{
    accessToken: string;
    refreshToken:string
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService) {}
    @Post('login')
    async loginUser(@Body() credentials:LoginUserDto, @Res() response : Response){
        const tokens = await this.authService.loginUser(credentials)
        response.cookie('refreshToken', tokens.refreshToken)
        return response.status(201).json({accessToken:tokens.accessToken})
    }
} 