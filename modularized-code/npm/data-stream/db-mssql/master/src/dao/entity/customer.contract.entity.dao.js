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
exports.CustomerContractEntityDao = void 0;
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
class CustomerContractEntityDao extends audit_class_1.AuditClass {
    constructor(host, username, password, databaseName) {
        super();
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./dao/mssql/user.dao");
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        database_credential_1.DatabaseCredential.set(host, username, password, databaseName);
        if (host) {
            initialize_database_1.sequelizer.sync();
        }
    }
    /**
     * This Function use to upsert data from Vendor and VendorBusinessUnit
     * @param commonRequest
     * @return VendorEntityModelDto
     */
    sync(commonRequest) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[CustomerContract Entity DAO] sync...");
            try {
                const customerContract = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.customerContract;
                let customerContractItem = (_b = commonRequest.body) === null || _b === void 0 ? void 0 : _b.customerContractItem;
                let customerContactFinal;
                let customerContactItemFinal;
                const customerContactItemTransactionData = yield database_1.sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    var _c;
                    let ccData = {};
                    let dataValues;
                    if (!customerContract.customerContractId) {
                        console.log("-=- create customer contract-=-");
                        ccData = yield index_1.CustomerContract.create(customerContract, { transaction: t });
                        dataValues = ccData.dataValues;
                    }
                    else {
                        console.log("-=- upsert customer contract-=-");
                        ccData = yield index_1.CustomerContract.upsert(customerContract, { transaction: t });
                        dataValues = ccData[0].dataValues;
                    }
                    if (dataValues) {
                        this.setParentSource(dataValues);
                        const customerContractId = dataValues.customerContractId;
                        customerContactFinal = dataValues;
                        customerContactFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER_CONTRACT;
                        customerContactFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_CONTRACT;
                        customerContactFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                        if (customerContractItem) {
                            customerContractItem.customerContractId = customerContractId;
                            customerContractItem = this.addAuditAttribute(customerContractItem);
                            customerContractItem.uniqueKey = String(customerContractId);
                            let cContractItemData;
                            let cContractItemDataValue;
                            if (!customerContractItem.customerContractItemId) {
                                console.log("-=- create customer contract item-=-");
                                cContractItemData = yield index_1.CustomerContractItem.create(customerContractItem, { transaction: t });
                                cContractItemDataValue = cContractItemData === null || cContractItemData === void 0 ? void 0 : cContractItemData.dataValues;
                            }
                            else {
                                console.log("-=- upsert customer contract item-=-");
                                cContractItemData = yield index_1.CustomerContractItem.upsert(customerContractItem, { transaction: t });
                                cContractItemDataValue = (_c = cContractItemData[0]) === null || _c === void 0 ? void 0 : _c.dataValues;
                            }
                            customerContactItemFinal = cContractItemDataValue;
                            customerContactItemFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.CUSTOMER_CONTRACT_ITEM;
                            customerContactItemFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.CUSTOMER_CONTRACT_ITEM;
                            customerContactItemFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                        }
                    }
                    const customerEntityModelDto = {
                        customerContract: customerContactFinal,
                        customerContractItem: customerContactItemFinal
                    };
                    return customerEntityModelDto;
                })); // trasaction end
                return customerContactItemTransactionData;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
        });
    }
}
exports.CustomerContractEntityDao = CustomerContractEntityDao;
//# sourceMappingURL=customer.contract.entity.dao.js.map