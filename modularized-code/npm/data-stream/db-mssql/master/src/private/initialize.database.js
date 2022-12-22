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
exports.sequelizer = void 0;
const stackTrace = __importStar(require("stack-trace"));
const index_1 = require("../models/index");
const database_1 = require("./database");
class Sequelizer {
    constructor() {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
    }
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // initialize models
                // const models = {
                //   role: CustomerContract,
                // };
                // Associate Tables and create Foreign key
                // onDelete: "CASCADE" - when the vehicle was deleted, the child fk will set to null
                if (Object.keys(index_1.Customer.associations).length === 0 && Object.keys(index_1.Vendor.associations).length === 0
                    && Object.keys(index_1.CustomerContract.associations).length === 0) {
                    console.log("-=-= table sync start -=-=-");
                    index_1.Customer.hasMany(index_1.CustomerBusinessUnit, { foreignKey: "customerId", sourceKey: "customerId", as: "cb" });
                    index_1.Customer.hasMany(index_1.CustomerContact, { foreignKey: "customerId", sourceKey: "customerId", as: "cc" });
                    index_1.CustomerBusinessUnit.belongsTo(index_1.Customer, {
                        foreignKey: "customerId", targetKey: "customerId"
                    });
                    index_1.CustomerContact.belongsTo(index_1.Customer, {
                        foreignKey: "customerId", targetKey: "customerId"
                    });
                    index_1.Customer.hasMany(index_1.CustomerContract, { foreignKey: "customerId", sourceKey: "customerId", as: "cmcct" });
                    index_1.CustomerContract.belongsTo(index_1.CustomerContract, {
                        foreignKey: "parentContractId", targetKey: "parentContractId"
                    });
                    index_1.CustomerContract.hasMany(index_1.CustomerContractItem, { foreignKey: "customerContractId", sourceKey: "customerContractId", as: "cctItm" });
                    index_1.CustomerContractItem.belongsTo(index_1.CustomerContract, {
                        foreignKey: "customerContractId", targetKey: "customerContractId"
                    });
                    index_1.Vendor.hasMany(index_1.VendorBusinessUnit, { foreignKey: "vendorId", sourceKey: "vendorId", as: "vbu" });
                    index_1.VendorBusinessUnit.belongsTo(index_1.Vendor, {
                        foreignKey: "vendorId", targetKey: "vendorId"
                    });
                    index_1.Material.hasMany(index_1.MaterialItem, { foreignKey: "materialId", sourceKey: "materialId", as: "mmi" });
                    index_1.MaterialItem.belongsTo(index_1.Material, {
                        foreignKey: "materialId", targetKey: "materialId"
                    });
                    // Create the table
                    const db = yield database_1.sequelize.sync();
                    // Alter the table
                    // await sequelize.sync({alter: true});
                }
            }
            catch (error) {
                console.log("@@ table sync start error => ", error);
                // applicationInsightsService.errorModel(error, "sequelizeSync", this.traceFileName);
            }
        });
    }
}
exports.sequelizer = new Sequelizer();
//# sourceMappingURL=initialize.database.js.map