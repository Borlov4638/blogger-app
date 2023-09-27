import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { CrytoModule } from "../crypto/crypto.module";
import { MongooseModule } from "@nestjs/mongoose";
import { User, usersSchema } from "../entyties/users.chema";

@Module({
    controllers:[UsersController],
    providers:[UsersService],
    imports:[CrytoModule, MongooseModule.forFeature([{name:User.name, schema:usersSchema}])]
})

export class UsersModule {}