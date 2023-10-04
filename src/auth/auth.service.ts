import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { CryptoService } from "../crypto/crypto.service";
import { UserDocument } from "../entyties/users.chema";
import { UsersService } from "../users/users.service";
import { UtilsService } from "../utils/utils.service";
import { SessionService } from "./sessions.service";
import { SessionDocument } from "../entyties/session.schema";

interface ILoginUser{
    loginOrEmail:string
    password:string
}

interface IUsersAcessToken{
    id:string
    email:string
    login:string
}
interface IUsersRefreshToken{
    id:string
    email:string
    login:string
    deviceId:string
}

interface INewUsersData {
    email: string;
    login: string;
    password: string;
  }

interface IPasswordRecovery{
    newPassword:string
    recoveryCode:string
}


@Injectable()
export class AuthService{
    constructor(private readonly userService : UsersService, private cryptoService:CryptoService, private jwtService : JwtService, private utilsService : UtilsService, private readonly sessionService : SessionService){}

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

    private async _getUsersAccessToken(user:IUsersAcessToken, exp:number|string){
        return await this.jwtService.signAsync({id:user.id, email:user.email, login:user.login}, {expiresIn:exp})
    }

    private async _getUsersRefreshToken(user:IUsersAcessToken, exp:number|string, deviceId:string){
        return await this.jwtService.signAsync({id:user.id, email:user.email, login:user.login, deviceId:deviceId}, {expiresIn:exp})
    }


    private async _getTokenDataAndVerify(token:string){
        try{
            return await this.jwtService.verifyAsync(token)
        }catch(err){
            throw new UnauthorizedException()
        }    
    }

    async loginUser(credentials: ILoginUser, request : Request){
        const user = await this._checkCredentials(credentials)
        const reftrsTokenExpDate = 3600
        const sessionData :SessionDocument = await this.sessionService.createNewSession(request, user, reftrsTokenExpDate)
        const accessToken = await this._getUsersAccessToken(user, 360)
        const refreshToken = await this._getUsersRefreshToken(user, reftrsTokenExpDate, sessionData.deviceId)
        return {accessToken, refreshToken}
    }

    async getNewTokenPair(request : Request){
        const data : IUsersRefreshToken = await this._getTokenDataAndVerify(request.cookies.refreshToken)
        const reftrsTokenExpDate = 3600
        await this.sessionService.updateCurrentSession(request, reftrsTokenExpDate, data.deviceId)
        const accessToken = await this._getUsersAccessToken(data, 360)
        const refreshToken = await this._getUsersRefreshToken(data, reftrsTokenExpDate, data.deviceId)
        return {accessToken, refreshToken}
    }

    async registrateUser(data:INewUsersData){
        const isUserExistsbyEmail = await this.userService.getUserByLoginOrEmail(data.email)
        if(isUserExistsbyEmail){
            throw new BadRequestException('registration email')
        }
        const isUserExistsbyLogin = await this.userService.getUserByLoginOrEmail(data.login)
        if(isUserExistsbyLogin){
            throw new BadRequestException('registration login')
        }
        return await this.userService.createUser(data, false)
    }

    async confirmRegistration(code:string){
        await this.userService.confirmUserByCode(code)
    }

    async resendConfirmationEmail(email:string){
        const user = await this.userService.getUserByLoginOrEmail(email)
        if(!user){
            throw new BadRequestException('invalid email')
        }
        if(user.emailConfirmation.isConfirmed === true){
            throw new BadRequestException('invalid email')
        }
        const newCode = user.newConfirmationCode()
        await user.save()
        await this.utilsService.sendConfirmationViaEmail(user.email, newCode)
        return
    }

    async sendPasswordRecoveryCode(email:string){
        const user = await this.userService.getUserByLoginOrEmail(email)
        if(!user){
            return
        }
        const code = await this._getUsersAccessToken(user, 1800)
        await this.utilsService.sendPassRecoweryMail(user.email, code)
        return
    }

    async recoverPassword(data:IPasswordRecovery){
        const userData : IUsersAcessToken = await this._getTokenDataAndVerify(data.recoveryCode)
        const user = await this.userService.getUserByLoginOrEmail(userData.email)
        if(!user){
            return
        }
        await this.userService.changePassword(data.newPassword, user)
        return
    }

    async 
}