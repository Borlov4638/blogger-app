import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CrytoModule } from "src/crypto/crypto.module";
import { UsersModule } from "src/users/users.module";

@Module({
    controllers:[AuthController],
    providers:[AuthService],
    imports:[CrytoModule, UsersModule]
})
export class AuthModule{}