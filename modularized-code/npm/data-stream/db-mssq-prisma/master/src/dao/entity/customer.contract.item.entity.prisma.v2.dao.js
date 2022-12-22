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
exports.CustomerContractItemEntityPrismaV2Dao = void 0;
const stackTrace = __importStar(require("stack-trace"));
const audit_class_1 = require("./etc/audit.class");
const CONSTANTS_json_1 = require("../../constants/CONSTANTS.json");
const CONSTANTS_json_2 = require("../../constants/CONSTANTS.json");
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const client_1 = require("@prisma/client");
const helper_1 = require("../../utils/helper");
class CustomerContractItemEntityPrismaV2Dao extends audit_class_1.AuditClass {
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[CustomerContractItem Entity DAO] Xsync...");
            try {
                const customerContract = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.customerContract;
                const customerContractItems = (_b = commonRequest.body) === null || _b === void 0 ? void 0 : _b.customerContractItem;
                let customerContactFinal;
                let customerContactItemFinal;
                const customerContactItemFinalList = [];
                const validateCustomerContractId = yield this.prisma.customerContract.findFirst({
                    where: { customerContractId: customerContract.customerContractId },
                });
                if (!validateCustomerContractId) {
                    throw new astrafms_services_error_logging_1.ErrorModel(CONSTANTS_json_2.STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, `customerContractId Not Found ${customerContract.customerContractId}`, String(customerContract.transactionId));
                }
                const customerContactItemTransactionData = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    this.setParentSource(customerContract);
                    const customerContractId = customerContract.customerContractId;
                    customerContactFinal = customerContract;
                    customerContactFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER_CONTRACT;
                    customerContactFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_CONTRACT;
                    customerContactFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                    if (customerContractItems && customerContractItems.length >= 1) {
                        yield Promise.all(customerContractItems.map((customerContractItem) => __awaiter(this, void 0, void 0, function* () {
                            customerContractItem.customerContractId = customerContractId;
                            customerContractItem = this.addAuditAttribute(customerContractItem);
                            customerContractItem.uniqueKey = String(customerContractId) + String(customerContractItem.lineItemNumber);
                            // remove un registered fields
                            customerContractItem = helper_1.helper.stripPrisma(this.prisma.customerContractItem, customerContractItem);
                            const cContractItemDataValue = yield tx.customerContractItem.upsert({
                                where: {
                                    lineItemNumber_customerContractId: {
                                        lineItemNumber: customerContractItem.lineItemNumber,
                                        customerContractId: customerContractItem.customerContractId
                                    }
                                },
                                update: Object.assign({}, customerContractItem),
                                create: Object.assign({}, customerContractItem),
                            });
                            customerContactItemFinal = cContractItemDataValue;
                            customerContactItemFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                            customerContactItemFinalList.push(customerContactItemFinal);
                        })));
                    }
                    const customerItemEntityModelDto = {
                        action: CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_CONTRACT_ITEM,
                        // entity: DELTA_SINK.ENTITY.CUSTOMER_CONTRACT_ITEM,
                        transactionId: customerContract.transactionId,
                        customerContractItem: customerContactItemFinalList
                    };
                    return customerItemEntityModelDto;
                }), {
                    maxWait: this.maxWait,
                    timeout: this.timeout, // default: 5000
                }); // trasaction end
                return customerContactItemTransactionData;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
            finally {
                // console.log("--customer contract finally called--")
                // await prisma.$disconnect()
            }
        });
    }
}
exports.CustomerContractItemEntityPrismaV2Dao = CustomerContractItemEntityPrismaV2Dao;
//# sourceMappingURL=customer.contract.item.entity.prisma.v2.dao.js.map