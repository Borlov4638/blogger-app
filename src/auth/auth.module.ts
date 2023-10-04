import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CrytoModule } from "../crypto/crypto.module";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { SessionService } from "./sessions.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, sessionSchema } from "../entyties/session.schema";
@Global()
@Module({
    controllers:[AuthController],
    providers:[AuthService, SessionService, ],
    imports:[CrytoModule, UsersModule, JwtModule.register({
        secret: 'dhcfgvhbjnkmjbhvgjfgfcjhvkbljnknjbhvghjg',
        global:true
        }),
    MongooseModule.forFeature([{name:Session.name, schema: sessionSchema}])
    ],
    exports:[SessionService]
})
export class AuthModule{}