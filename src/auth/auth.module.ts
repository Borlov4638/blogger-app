import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CrytoModule } from "src/crypto/crypto.module";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { SessionService } from "./sessions.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, sessionSchema } from "src/entyties/session.schema";

@Module({
    controllers:[AuthController],
    providers:[AuthService, SessionService, ],
    imports:[CrytoModule, UsersModule, JwtModule.register({
        secret: 'dhcfgvhbjnkmjbhvgjfgfcjhvkbljnknjbhvghjg',
        global:true
        }),
    MongooseModule.forFeature([{name:Session.name, schema: sessionSchema}])
    ]
})
export class AuthModule{}