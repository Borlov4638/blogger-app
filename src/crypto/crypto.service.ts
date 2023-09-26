import * as bcrypt from 'bcrypt'

export class CryptoService{

    async getHash(data:string | Buffer, saltOrRounds : string | number){
        return await bcrypt.hash(data, saltOrRounds)
    }
}