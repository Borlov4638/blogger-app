import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersPaganationQuery } from "./dto/users.dto";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService :UsersService){}

    @Get()
    async getAllUsers(@Query() paganation : UsersPaganationQuery){
        return await this.usersService.getAllUsers(paganation)
    }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async createUser(@Body('login') login:string,@Body("email") email: string, @Body('password') password :string){
        return await this.usersService.createUser({email, login, password})
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteUserById(@Param('id') id:string){
        this.usersService.deleteUserById(id)
    }
} 