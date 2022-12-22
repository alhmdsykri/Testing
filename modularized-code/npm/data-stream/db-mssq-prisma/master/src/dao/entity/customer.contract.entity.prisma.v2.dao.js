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
exports.CustomerContractEntityPrismaV2Dao = void 0;
const stackTrace = __importStar(require("stack-trace"));
const audit_class_1 = require("./etc/audit.class");
const CONSTANTS_json_1 = require("../../constants/CONSTANTS.json");
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const client_1 = require("@prisma/client");
const helper_1 = require("../../utils/helper");
class CustomerContractEntityPrismaV2Dao extends audit_class_1.AuditClass {
    // maxWait: The maximum amount of time the Prisma Client will wait to acquire a transaction from the database. The default value is 2 seconds.
    // timeout: The maximum amount of time the interactive transaction can run before being canceled and rolled back. The default value is 5 seconds.
    constructor(prisma, options) {
        var _a, _b;
        super();
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./dao/mssql/customer.contract.entity.prisma.dao");
        this.prisma = null;
        this.maxWait = 2000; // default, override in env var
        this.timeout = 5000; // default, override in env var
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        if (!prisma) {
            this.logger.info("@@ Create new Instance of Prisma");
            // this.prisma = new PrismaClient({ log: ["query"]});
            this.prisma = new client_1.PrismaClient();
        }
        else {
            console.log("from constructor");
            this.prisma = prisma;
        }
        if (options && options.sql) {
            this.maxWait = ((_a = options.sql) === null || _a === void 0 ? void 0 : _a.maxWait) || this.maxWait;
            this.timeout = ((_b = options.sql) === null || _b === void 0 ? void 0 : _b.timeout) || this.timeout;
        }
    }
    /**
     * This Function use to upsert data from CustomerContract and CustomerContractItem
     * @param commonRequest
     * @return CustomerContractEntityModelDto
     */
    sync(commonRequest) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[CustomerContract Entity DAO] xxxsync...");
            try {
                let customerContract = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.customerContract;
                // remove unregistered fields
                customerContract = helper_1.helper.stripPrisma(this.prisma.customerContract, customerContract);
                let customerContactFinal;
                const customerContactItemTransactionData = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const dataValues = yield tx.customerContract.upsert({
                        where: {
                            contractNumber: customerContract.contractNumber,
                        },
                        update: Object.assign({}, customerContract),
                        create: Object.assign({}, customerContract),
                    });
                    customerContactFinal = dataValues;
                    customerContactFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER_CONTRACT;
                    customerContactFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_CONTRACT;
                    customerContactFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                    const customerEntityModelDto = {
                        customerContract: customerContactFinal,
                        customerContractItem: []
                    };
                    return customerEntityModelDto;
                }), {
                    maxWait: this.maxWait,
                    timeout: this.timeout, // default: 5000
                }); // trasaction end
                return customerContactItemTransactionData;
            }
            catch (error) {
                // const err: any = prismaErrorHelper.getPrismaErrorInstance(error);
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
            finally {
                // console.log("--customer contract finally called--")
                // await prisma.$disconnect()
            }
        });
    }
}
exports.CustomerContractEntityPrismaV2Dao = CustomerContractEntityPrismaV2Dao;
//# sourceMappingURL=customer.contract.entity.prisma.v2.dao.js.map