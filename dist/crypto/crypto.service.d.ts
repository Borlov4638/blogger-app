/// <reference types="node" />
export declare class CryptoService {
    getHash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
}
