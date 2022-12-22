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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerEntityDao = void 0;
const stackTrace = __importStar(require("stack-trace"));
const audit_class_1 = require("./etc/audit.class");
const CONSTANTS_json_1 = require("../../constants/CONSTANTS.json");
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const database_credential_1 = require("../../private/database.credential");
const initialize_database_1 = require("../../private/initialize.database");
const index_1 = require("../../models/index");
const sequelize_1 = __importDefault(require("sequelize"));
// sequelize Direct object to dabase connection
const database_1 = require("../../private/database");
const Op = sequelize_1.default.Op;
class CustomerEntityDao extends audit_class_1.AuditClass {
    constructor(host, username, password, databaseName) {
        super();
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./dao/entity/customer-contract/customer-contract.dao");
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        database_credential_1.DatabaseCredential.set(host, username, password, databaseName);
        if (host) {
            initialize_database_1.sequelizer.sync();
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
                const customer = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.customer;
                const customerBusinessUnitBody = (_b = commonRequest.body) === null || _b === void 0 ? void 0 : _b.customerBusinessUnit;
                const customerContactBody = (_c = commonRequest.body) === null || _c === void 0 ? void 0 : _c.customerContact;
                let customerFinal;
                let customerBusinessUnitFinal;
                const customerBusinessUnitFinalList = [];
                let customerContactFinal;
                const customerContactFinalList = [];
                const customerTransactionData = yield database_1.sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    // Upsert to DB
                    customer.uniqueKey = String(customer.customerCode);
                    const custData = yield index_1.Customer.upsert(customer, { transaction: t });
                    if (custData && Array.isArray(custData) && custData.length >= 1) {
                        const dataValues = custData[0].dataValues;
                        this.setParentSource(dataValues);
                        const customerId = dataValues.customerId;
                        customerFinal = dataValues;
                        customerFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER;
                        customerFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER;
                        customerFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                        if (customerBusinessUnitBody && customerBusinessUnitBody.length >= 1) {
                            yield Promise.all(customerBusinessUnitBody.map((customerBusinessUnit) => __awaiter(this, void 0, void 0, function* () {
                                customerBusinessUnit.customerId = customerId;
                                customerBusinessUnit = this.addAuditAttribute(customerBusinessUnit);
                                // Upsert to DB
                                const custBUData = yield index_1.CustomerBusinessUnit.upsert(customerBusinessUnit, {
                                    transaction: t,
                                    logging: false
                                });
                                if (custBUData && Array.isArray(custBUData) && custBUData.length >= 1) {
                                    const custBUdataValues = custBUData[0].dataValues;
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
                                customerContact.customerId = customerId;
                                customerContact = this.addAuditAttribute(customerContact);
                                // Upsert to DB
                                const custContactData = yield index_1.CustomerContact.upsert(customerContact, { transaction: t });
                                if (custContactData && Array.isArray(custContactData) && custContactData.length >= 1) {
                                    const cContactdataValues = custContactData[0].dataValues;
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
                })); // trasaction end
                return customerTransactionData;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
        });
    }
}
exports.CustomerEntityDao = CustomerEntityDao;
//# sourceMappingURL=customer.entity.dao.js.map