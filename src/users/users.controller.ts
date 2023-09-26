import { Body, Controller, Get, Post } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService :UsersService){}

    @Get()
    getAllUsers(){

    }

    @Post()
    async createUser(@Body('login') login:string,@Body("email") email: string, @Body('password') password :string){
        return await this.usersService.createUser({email, login, password})
        
    }
} 