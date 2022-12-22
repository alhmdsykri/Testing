"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorEntityPrismaService = void 0;
const stackTrace = __importStar(require("stack-trace"));
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const astrafms_db_mssql_prisma_data_stream_master_1 = require("astrafms-db-mssql-prisma-data-stream-master");
class VendorEntityPrismaService {
    constructor(prisma, option) {
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./services/vendor.entity.prisma.service");
        this.prisma = null;
        this.option = null;
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        this.prisma = prisma;
        this.option = option;
    }
    sync(commonRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("[sync]...start");
            try {
                const vendorEntityPrismaDao = new astrafms_db_mssql_prisma_data_stream_master_1.VendorEntityPrismaDao(this.prisma, this.option);
                const result = yield vendorEntityPrismaDao.sync(commonRequest);
                return result;
            }
            catch (error) {
                console.log("@@ error -->> ", error);
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
        });
    }
}
exports.VendorEntityPrismaService = VendorEntityPrismaService;
//# sourceMappingURL=vendor.entity.service.prisma.js.map