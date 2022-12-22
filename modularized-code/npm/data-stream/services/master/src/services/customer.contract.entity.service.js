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
exports.CustomerContractEntityService = void 0;
const stackTrace = __importStar(require("stack-trace"));
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const astrafms_db_mssql_data_stream_master_1 = require("astrafms-db-mssql-data-stream-master");
class CustomerContractEntityService {
    constructor(host, username, password, databaseName) {
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./services/customer.contract.entity.service");
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        this.customerContractEntityDao = new astrafms_db_mssql_data_stream_master_1.CustomerContractEntityDao(null, null, null, null);
        if (host) {
            // sequelize.sync();
            this.customerContractEntityDao = new astrafms_db_mssql_data_stream_master_1.CustomerContractEntityDao(host, username, password, databaseName);
        }
    }
    sync(commonRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info("[sync]...start");
            try {
                const result = yield this.customerContractEntityDao.sync(commonRequest);
                return result;
            }
            catch (error) {
                console.log("@@ error -->> ", error);
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
        });
    }
}
exports.CustomerContractEntityService = CustomerContractEntityService;
//# sourceMappingURL=customer.contract.entity.service.js.map