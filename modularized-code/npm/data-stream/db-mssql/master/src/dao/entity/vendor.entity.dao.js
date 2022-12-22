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
exports.VendorEntityDao = void 0;
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
class VendorEntityDao extends audit_class_1.AuditClass {
    constructor(host, username, password, databaseName) {
        super();
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./dao/entity/vendor.entity.dao");
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
            console.log("[Vendor Entity DAO] sync...");
            try {
                const vendor = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.vendor;
                const vendorBusinessUnitBody = (_b = commonRequest.body) === null || _b === void 0 ? void 0 : _b.businessUnit;
                let vendorFinal;
                let vendorBusinessUnitFinal;
                const vendorBusinessUnitFinalList = [];
                const vendorTransactionData = yield database_1.sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    vendor.uniqueKey = String(vendor.vendorCode);
                    const vendData = yield index_1.Vendor.upsert(vendor, { transaction: t });
                    if (vendData && Array.isArray(vendData) && vendData.length >= 1) {
                        const dataValues = vendData[0].dataValues;
                        this.setParentSource(dataValues);
                        const vendorId = dataValues.vendorId;
                        vendorFinal = dataValues;
                        vendorFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.VENDOR;
                        vendorFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.VENDOR;
                        vendorFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                        if (vendorBusinessUnitBody && vendorBusinessUnitBody.length >= 1) {
                            yield Promise.all(vendorBusinessUnitBody.map((vendorBusinessUnit) => __awaiter(this, void 0, void 0, function* () {
                                vendorBusinessUnit.vendorId = vendorId;
                                vendorBusinessUnit = this.addAuditAttribute(vendorBusinessUnit);
                                const vendorBUData = yield index_1.VendorBusinessUnit.upsert(vendorBusinessUnit, { transaction: t });
                                if (vendorBUData && Array.isArray(vendorBUData) && vendorBUData.length >= 1) {
                                    const vendorBUdataValues = vendorBUData[0].dataValues;
                                    vendorBusinessUnitFinal = vendorBUdataValues;
                                    vendorBusinessUnitFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.VENDOR_BUSINESS_UNIT;
                                    vendorBusinessUnitFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.VENDOR_BUSINESS_UNIT;
                                    vendorBusinessUnitFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                                    vendorBusinessUnitFinalList.push(vendorBusinessUnitFinal);
                                }
                            }))); // promise end customerBusinessUnitBody
                        }
                    }
                    const customerEntityModelDto = {
                        vendor: vendorFinal,
                        businessUnit: vendorBusinessUnitFinalList,
                    };
                    return customerEntityModelDto;
                })); // trasaction end
                return vendorTransactionData;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
        });
    }
}
exports.VendorEntityDao = VendorEntityDao;
//# sourceMappingURL=vendor.entity.dao.js.map