"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_service_1 = require("../crypto/crypto.service");
const users_chema_1 = require("../entyties/users.chema");
let UsersService = class UsersService {
    constructor(userModel, cryptoService) {
        this.userModel = userModel;
        this.cryptoService = cryptoService;
    }
    async createUser(data) {
        const hashedPassword = await this.cryptoService.getHash(data.password, 10);
        const newUser = new this.userModel({ ...data, password: hashedPassword });
        return await newUser.save();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    __param(0, (0, mongoose_1.InjectModel)(users_chema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, crypto_service_1.CryptoService])
], UsersService);
//# sourceMappingURL=users.service.js.map