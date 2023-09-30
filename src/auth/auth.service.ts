import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { CryptoService } from "src/crypto/crypto.service";
import { UserDocument } from "src/entyties/users.chema";
import { UsersService } from "src/users/users.service";
import { UtilsService } from "src/utils/utils.service";

interface ILoginUser{
    loginOrEmail:string
    password:string
}

interface IUsersToken{
    id:string
    email:string
    login:string
}
interface INewUsersData {
    email: string;
    login: string;
    password: string;
  }


@Injectable()
export class AuthService{
    constructor(private readonly userService : UsersService, private cryptoService:CryptoService, private jwtService : JwtService, private utilsService : UtilsService){}

    private async _checkCredentials(credentials:ILoginUser){
        const user = await this.userService.getUserByLoginOrEmail(credentials.loginOrEmail)

        if(!user){
            throw new UnauthorizedException()
        }
        const isUserValid = await this.cryptoService.validateHash(credentials.password, user.password)

        if(!isUserValid){
            throw new UnauthorizedException()
        }
        return user
    }

    private async _getUsersToken(user:IUsersToken, exp:number|string){
        return await this.jwtService.signAsync({id:user.id, email:user.email, login:user.login}, {expiresIn:exp})
    }

    private async _getTokenDataAndVerify(token:string){
        return await this.jwtService.verifyAsync(token)
    }

    async loginUser(credentials: ILoginUser){
        const user = await this._checkCredentials(credentials)
        const accessToken = await this._getUsersToken(user, 10)
        const refreshToken = await this._getUsersToken(user, 30)
        return {accessToken, refreshToken}
    }

    async getNewTokenPair(request : Request){
        const data : IUsersToken = await this._getTokenDataAndVerify(request.cookies.refreshToken)
        const accessToken = await this._getUsersToken(data, 10)
        const refreshToken = await this._getUsersToken(data, 30)
        return {accessToken, refreshToken}
    }

    async registrateUser(data:INewUsersData){
        return await this.userService.createUser(data, false)
    }

    async confirmRegistration(code:string){
        this.userService.confirmUserByCode(code)
    }

    async resendConfirmationEmail(email:string){
        const user = await this.userService.getUserByLoginOrEmail(email)
        if(!user){
            return
        }
        await this.utilsService.sendConfirmationViaEmail(user.email, user.emailConfirmation.confirmationCode)
        return
    }

}