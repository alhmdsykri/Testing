"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaErrorModel = void 0;
class PrismaErrorModel {
    constructor(errorInstrance, name, errorCode, message, meta, isErrorForResend, stack) {
        this.errorInstance = errorInstrance;
        this.name = name;
        this.errorCode = errorCode;
        this.message = message;
        this.meta = meta;
        this.isErrorForResend = isErrorForResend;
        this.stack = stack;
    }
}
exports.PrismaErrorModel = PrismaErrorModel;
//# sourceMappingURL=prisma.error.model.js.map