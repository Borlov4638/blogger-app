import { Body, Controller, Post } from "@nestjs/common";
import { LoginUserDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService) {}
    @Post('login')
    async loginUser(@Body() credentials:LoginUserDto){
        return await this.authService.loginUser(credentials)
    }
} 