import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CryptoService } from "src/crypto/crypto.service";
import { UsersService } from "src/users/users.service";

interface ILoginUser{
    loginOrEmail:string
    password:string
}

@Injectable()
export class AuthService{
    constructor(private readonly userService : UsersService, private cryptoService:CryptoService){}

    private async _checkCredentials(credentials:ILoginUser){
        const user = await this.userService.getUserByLoginOrEmail(credentials)

        if(!user){
            throw new UnauthorizedException()
        }
        const isUserValid = await this.cryptoService.validateHash(credentials.password, user.password)

        if(!isUserValid){
            throw new UnauthorizedException()
        }
        return user
    }

    async loginUser(credentials: ILoginUser){
        const user = await this._checkCredentials(credentials)
        return user
    }
}