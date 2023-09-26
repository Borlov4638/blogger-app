import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CryptoService } from "src/crypto/crypto.service";
import { User } from "src/entyties/users.chema";

interface ICreateUser {
    email: string;
    login:string
    password:string
}


export class UsersService {
    constructor(@InjectModel(User.name) private userModel : Model<User>, private readonly cryptoService : CryptoService){}

    async createUser(data: ICreateUser){
        const hashedPassword = await this.cryptoService.getHash(data.password, 10)
        const newUser = new this.userModel({...data, password:hashedPassword})
        return await newUser.save()

    }
}