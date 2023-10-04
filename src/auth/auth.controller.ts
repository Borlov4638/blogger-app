import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LoginUserDto, PasswordRecoveryDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { BearerAccessAuthGuard, BearerRefreshAuthGuard } from "./guards/auth.bearer.guard";
import { CreateUserDto } from "../users/dto/users.dto";
import { SessionService } from "./sessions.service";

interface ITokens{
    accessToken: string;
    refreshToken:string
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService, private readonly sessionService : SessionService) {}
    @Post('login')
    async loginUser(@Body() credentials:LoginUserDto, @Res() response : Response, @Req() request:Request){
        const tokens : ITokens = await this.authService.loginUser(credentials, request)
        response.cookie('refreshToken', tokens.refreshToken)
        return response.status(200).json({accessToken:tokens.accessToken})
    }

    @UseGuards(BearerRefreshAuthGuard)
    @Post('refresh-token')
    async getNewTokenPair(@Req() request : Request, @Res() response : Response){
        await this.sessionService.validateSession(request)
        const tokens = await this.authService.getNewTokenPair(request)
        response.cookie('refreshToken', tokens.refreshToken)
        return response.status(200).json({accessToken:tokens.accessToken})
    }

    @HttpCode(HttpStatus.NO_CONTENT)
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

    @Post('password-recovery')
    async sendPasswordRecoveryCode(@Body('email') email: string) {
        await this.authService.sendPasswordRecoveryCode(email);
    }

    @Post('new-password')
    async newPassword(@Body() data:PasswordRecoveryDto){
        this.authService.recoverPassword(data)
    }
    
    @UseGuards(BearerAccessAuthGuard, BearerRefreshAuthGuard)
    @Post('logout')
    async logoutUser(@Req() request:Request){
        await this.sessionService.validateSession(request)
        await this.sessionService.deleteCurrentSession(request)
    }
} 