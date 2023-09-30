import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CryptoService } from "src/crypto/crypto.service";
import { UserDocument } from "src/entyties/users.chema";
import { UsersService } from "src/users/users.service";

interface ILoginUser{
    loginOrEmail:string
    password:string
}

@Injectable()
export class AuthService{
    constructor(private readonly userService : UsersService, private cryptoService:CryptoService, private jwtService : JwtService){}

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
        const accessToken = await this._getToken(user, 10)
        const refreshToken = await this._getToken(user, 30)
        return {accessToken, refreshToken}
    }

    private async _getToken(user:UserDocument, exp:number|string){
        return await this.jwtService.signAsync({userId:user.id, email:user.email, login:user.login}, {expiresIn:exp})
    }
}