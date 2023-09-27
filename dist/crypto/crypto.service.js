"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const bcrypt = require("bcrypt");
class CryptoService {
    async getHash(data, saltOrRounds) {
        return await bcrypt.hash(data, saltOrRounds);
    }
}
exports.CryptoService = CryptoService;
//# sourceMappingURL=crypto.service.js.map