import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CrytoModule } from "src/crypto/crypto.module";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    controllers:[AuthController],
    providers:[AuthService],
    imports:[CrytoModule, UsersModule, JwtModule.register({
        secret: 'dhcfgvhbjnkmjbhvgjfgfcjhvkbljnknjbhvghjg',
        global:true
    })]
})
export class AuthModule{}