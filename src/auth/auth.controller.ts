import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LoginUserDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { BearerRefreshAuthGuard } from "./guards/auth.bearer.guard";
import { CreateUserDto } from "src/users/dto/users.dto";

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

    @UseGuards(BearerRefreshAuthGuard)
    @Post('refresh-token')
    async getNewTokenPair(@Req() request : Request, @Res() response : Response){
        const tokens = await this.authService.getNewTokenPair(request)
        response.cookie('refreshToken', tokens.refreshToken)
        return response.status(201).json({accessToken:tokens.accessToken})
    }

    @Post('registration')
    async registrateUser(@Body() data: CreateUserDto){
        return await this.authService.registrateUser(data)
    }

    @Post('registration-confirmation')
    async confirmRegistration(@Body("code") token: string){
        this.authService.confirmRegistration(token)
    }

    @Post('registration-email-resending')
    async resendConfirmationEmail(@Body('email') email:string){
        this.authService.resendConfirmationEmail(email)
    }
} 