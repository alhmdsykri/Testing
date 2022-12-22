"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerContractItemEntityModelDto = exports.VendorEntityModelDto = exports.MaterialEntityModelDto = exports.CustomerContractEntityModelDto = exports.CustomerEntityModelDto = exports.CustomerContractItemEntityPrismaV2Dao = exports.CustomerContractEntityPrismaV2Dao = exports.CustomerContractEntityPrismaDao = exports.VendorEntityPrismaDao = exports.CustomerEntityPrismaDao = exports.MaterialEntityPrismaDao = exports.PrismaClient = void 0;
const index_1 = require("./src/dao/entity/index");
Object.defineProperty(exports, "MaterialEntityPrismaDao", { enumerable: true, get: function () { return index_1.MaterialEntityPrismaDao; } });
Object.defineProperty(exports, "CustomerEntityPrismaDao", { enumerable: true, get: function () { return index_1.CustomerEntityPrismaDao; } });
Object.defineProperty(exports, "VendorEntityPrismaDao", { enumerable: true, get: function () { return index_1.VendorEntityPrismaDao; } });
Object.defineProperty(exports, "CustomerContractEntityPrismaDao", { enumerable: true, get: function () { return index_1.CustomerContractEntityPrismaDao; } });
Object.defineProperty(exports, "CustomerContractEntityPrismaV2Dao", { enumerable: true, get: function () { return index_1.CustomerContractEntityPrismaV2Dao; } });
Object.defineProperty(exports, "CustomerContractItemEntityPrismaV2Dao", { enumerable: true, get: function () { return index_1.CustomerContractItemEntityPrismaV2Dao; } });
const index_2 = require("./src/dto/index");
Object.defineProperty(exports, "CustomerEntityModelDto", { enumerable: true, get: function () { return index_2.CustomerEntityModelDto; } });
Object.defineProperty(exports, "CustomerContractEntityModelDto", { enumerable: true, get: function () { return index_2.CustomerContractEntityModelDto; } });
Object.defineProperty(exports, "MaterialEntityModelDto", { enumerable: true, get: function () { return index_2.MaterialEntityModelDto; } });
Object.defineProperty(exports, "VendorEntityModelDto", { enumerable: true, get: function () { return index_2.VendorEntityModelDto; } });
Object.defineProperty(exports, "CustomerContractItemEntityModelDto", { enumerable: true, get: function () { return index_2.CustomerContractItemEntityModelDto; } });
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
//# sourceMappingURL=index.js.map