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
exports.CustomerEntityPrismaDao = void 0;
const stackTrace = __importStar(require("stack-trace"));
const audit_class_1 = require("./etc/audit.class");
const CONSTANTS_json_1 = require("../../constants/CONSTANTS.json");
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const _ = __importStar(require("lodash"));
const client_1 = require("@prisma/client");
const helper_1 = require("../../utils/helper");
class CustomerEntityPrismaDao extends audit_class_1.AuditClass {
    // maxWait: The maximum amount of time the Prisma Client will wait to acquire a transaction from the database. The default value is 2 seconds.
    // timeout: The maximum amount of time the interactive transaction can run before being canceled and rolled back. The default value is 5 seconds.
    constructor(prisma, options) {
        var _a, _b;
        super();
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./dao/entity/customer-contract/customer.entity.prisma.dao");
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
     * This Function use to upsert data from Customer, CustomerBusinessUnit and customerContact
     * @param commonRequest
     * @return CustomerEntityModelDto
     */
    sync(commonRequest) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[Customer Entity DAO] sync...");
            try {
                let customer = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.customer;
                const customerBusinessUnitBody = (_b = commonRequest.body) === null || _b === void 0 ? void 0 : _b.customerBusinessUnit;
                const customerContactBody = (_c = commonRequest.body) === null || _c === void 0 ? void 0 : _c.customerContact;
                let dataValues;
                let customerFinal;
                let customerBusinessUnitFinal;
                const customerBusinessUnitFinalList = [];
                let customerContactFinal;
                const customerContactFinalList = [];
                const customerTransactionData = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // remove unregistered fields
                    customer = helper_1.helper.stripPrisma(this.prisma.customer, customer);
                    // Upsert to DB
                    customer.uniqueKey = String(customer.customerCode);
                    dataValues = yield tx.customer.upsert({
                        where: {
                            customerCode: customer.customerCode,
                        },
                        update: Object.assign({}, customer),
                        create: Object.assign({}, customer),
                    });
                    if (dataValues) {
                        this.setParentSource(dataValues);
                        const customerId = dataValues.customerId;
                        customerFinal = dataValues;
                        customerFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER;
                        customerFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER;
                        customerFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                        if (customerBusinessUnitBody && customerBusinessUnitBody.length >= 1) {
                            yield Promise.all(customerBusinessUnitBody.map((customerBusinessUnit) => __awaiter(this, void 0, void 0, function* () {
                                // remove unregistered fields
                                customerBusinessUnit = helper_1.helper.stripPrisma(this.prisma.customerBusinessUnit, customerBusinessUnit);
                                customerBusinessUnit = _.omit(customerBusinessUnit, ["businessUnitCode"]);
                                customerBusinessUnit.customerId = customerId;
                                customerBusinessUnit = this.addAuditAttribute(customerBusinessUnit);
                                // Upsert to DB
                                const custBUdataValues = yield tx.customerBusinessUnit.upsert({
                                    where: {
                                        customerId_businessUnitId: {
                                            customerId,
                                            businessUnitId: customerBusinessUnit.businessUnitId
                                        }
                                    },
                                    update: Object.assign({}, customerBusinessUnit),
                                    create: Object.assign({}, customerBusinessUnit),
                                });
                                if (custBUdataValues) {
                                    customerBusinessUnitFinal = custBUdataValues;
                                    customerBusinessUnitFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER_BUSINESS_UNIT;
                                    customerBusinessUnitFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_BUSINESS_UNIT;
                                    customerBusinessUnitFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                                    customerBusinessUnitFinalList.push(customerBusinessUnitFinal);
                                }
                            }))); // promise end customerBusinessUnitBody
                        }
                        if (customerContactBody && customerContactBody.length >= 1) {
                            yield Promise.all(customerContactBody.map((customerContact) => __awaiter(this, void 0, void 0, function* () {
                                // Trasform workaround wrong datatype
                                if (customerContact.position !== null) {
                                    customerContact.position = String(customerContact.position);
                                }
                                // remove unregistered fields
                                customerContact = helper_1.helper.stripPrisma(this.prisma.customerContact, customerContact);
                                customerContact.customerId = customerId;
                                customerContact = this.addAuditAttribute(customerContact);
                                // Upsert to DB
                                const cContactdataValues = yield tx.customerContact.upsert({
                                    where: {
                                        customerId_customerContactCode: {
                                            customerId,
                                            customerContactCode: customerContact.customerContactCode
                                        }
                                    },
                                    update: Object.assign({}, customerContact),
                                    create: Object.assign({}, customerContact),
                                });
                                if (cContactdataValues) {
                                    customerContactFinal = cContactdataValues;
                                    customerContactFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER_CONTACT;
                                    customerContactFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_CONTACT;
                                    customerContactFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                                    customerContactFinalList.push(customerContactFinal);
                                }
                            }))); // promise end customerContactBody
                        }
                    }
                    const customerEntityModelDto = {
                        customer: customerFinal,
                        customerBusinessUnit: customerBusinessUnitFinalList,
                        customerContact: customerContactFinalList
                    };
                    return customerEntityModelDto;
                }), {
                    maxWait: this.maxWait,
                    timeout: this.timeout, // default: 5000
                }); // trasaction end
                return customerTransactionData;
            }
            catch (error) {
                // const err: any = prismaErrorHelper.getPrismaErrorInstance(error);
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
            finally {
                // console.log("--customer finally called--")
                // await prisma.$disconnect()
            }
        });
    }
}
exports.CustomerEntityPrismaDao = CustomerEntityPrismaDao;
//# sourceMappingURL=customer.entity.prisma.dao.js.map