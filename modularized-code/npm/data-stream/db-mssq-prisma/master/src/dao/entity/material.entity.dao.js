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
exports.MaterialEntityDao = void 0;
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
class MaterialEntityDao extends audit_class_1.AuditClass {
    constructor(host, username, password, databaseName) {
        super();
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./dao/entity/material/material.dao");
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        database_credential_1.DatabaseCredential.set(host, username, password, databaseName);
        if (host) {
            initialize_database_1.sequelizer.sync();
        }
    }
    /**
    * This Function use to upsert data from Material and MaterialItem
    * @param commonRequest
    * @return MaterialEntityModelDto
    */
    sync(commonRequest) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[Material Entity DAO] sync...");
            try {
                const material = (_a = commonRequest.body) === null || _a === void 0 ? void 0 : _a.material;
                const materialItemBody = (_b = commonRequest.body) === null || _b === void 0 ? void 0 : _b.materialItem;
                let materialFinal;
                let materialItemFinalList = [];
                const materialData = yield database_1.sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                    var _c;
                    let materialData = {};
                    let materialDataValue;
                    material.uniqueKey = String(material.materialCode);
                    const materialResult = yield index_1.Material.findOne({
                        where: { materialCode: material.materialCode },
                    });
                    if (materialResult) {
                        console.log("-=-=- update -=-");
                        materialData = yield index_1.Material.update(material, {
                            transaction: t, returning: true, where: { materialCode: material.materialCode }
                        });
                    }
                    else {
                        console.log("-=-=- create -=-");
                        materialData = yield index_1.Material.create(material, { transaction: t });
                    }
                    if (materialData && Array.isArray(materialData) && materialData.length > 0) {
                        console.log("-=-=- array -=- ", materialData);
                        materialDataValue = (_c = materialData[1][0]) === null || _c === void 0 ? void 0 : _c.dataValues;
                    }
                    else {
                        console.log("-=-=- NOT array -=- ", materialData);
                        materialDataValue = materialData === null || materialData === void 0 ? void 0 : materialData.dataValues;
                    }
                    console.log("-=-=-=-=- materialDataValue >>> ", materialDataValue);
                    if (materialDataValue) {
                        this.setParentSource(materialDataValue);
                        const materialId = materialDataValue.materialId;
                        materialFinal = materialDataValue;
                        materialFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.MATERIAL;
                        materialFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.MATERIAL;
                        materialFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                        if (materialItemBody && materialItemBody.length >= 1) {
                            yield Promise.all(materialItemBody.map((materialItem) => __awaiter(this, void 0, void 0, function* () {
                                var _d;
                                let materialItemFinal;
                                let materialItemData = {};
                                let materialItemDataValue;
                                materialItem.materialId = materialId;
                                materialItem = this.addAuditAttribute(materialItem);
                                // await MaterialItem.upsert(materialItem, { transaction: t });
                                const filter = {
                                    materialId: materialDataValue.materialId,
                                    businessUnitId: materialItem.businessUnitId,
                                };
                                const materialItemResult = yield index_1.MaterialItem.findOne({
                                    where: filter
                                });
                                if (materialItemResult) {
                                    console.log("-=-=- update Item -=-");
                                    materialItemData = yield index_1.MaterialItem.update(materialItem, {
                                        transaction: t, returning: true, where: filter
                                    });
                                }
                                else {
                                    console.log("-=-=- create Item -=-");
                                    materialItemData = yield index_1.MaterialItem.create(materialItem, { transaction: t });
                                }
                                if (materialItemData && Array.isArray(materialItemData) && materialItemData.length > 0) {
                                    console.log("-=-=- array item -=- ", materialItemData);
                                    materialItemDataValue = (_d = materialItemData[1][0]) === null || _d === void 0 ? void 0 : _d.dataValues;
                                }
                                else {
                                    console.log("-=-=- NOT array item -=- ", materialItemData);
                                    materialItemDataValue = materialItemData === null || materialItemData === void 0 ? void 0 : materialItemData.dataValues;
                                }
                                materialItemFinal = materialItemDataValue;
                                materialItemFinal.entity = CONSTANTS_json_1.DELTA_SINK.ENTITY.MATERIAL_ITEM;
                                materialItemFinal.action = CONSTANTS_json_1.DELTA_SINK.ACTION.MATERIAL_ITEM;
                                materialItemFinal.status = CONSTANTS_json_1.DELTA_SINK.STATUS;
                                materialItemFinalList.push(materialItemFinal);
                            }))); // promise end 
                        }
                    }
                    const materialEntityModelDto = {
                        material: materialFinal,
                        materialItem: materialItemFinalList,
                    };
                    return materialEntityModelDto;
                })); // trasaction end
                return materialData;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "sync", this.traceFileName);
            }
        });
    }
}
exports.MaterialEntityDao = MaterialEntityDao;
//# sourceMappingURL=material.entity.dao.js.map