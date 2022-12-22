"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helper = void 0;
class Helper {
    makeidTimestamp() {
        let result = "";
        const length = 5;
        // const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const numbers = Math.floor(Date.now() / 1000);
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result + numbers;
    }
    getPagination(page, size, defaultSize) {
        const limit = size ? +size : defaultSize;
        const offset = page ? page * limit : 0;
        return { limit, offset };
    }
}
exports.helper = new Helper();
//# sourceMappingURL=helper.js.map