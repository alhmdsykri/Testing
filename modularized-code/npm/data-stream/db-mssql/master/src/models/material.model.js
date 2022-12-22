"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = exports.MaterialModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
const tableName = "Material";
exports.MaterialModelName = tableName;
exports.Material = database_1.sequelize.define(tableName, {
    materialId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    serviceTypeId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    UOMCode: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    materialCode: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    materialName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: true
    },
    vehicleTypeId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    vehicleTypeCode: {
        type: sequelize_1.DataTypes.STRING(5), allowNull: false
    },
    vehicleTypeName: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    rentalDuration: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    rentalDurationType: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    isSLITrucking: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    businessUnitId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    businessUnitCode: {
        type: sequelize_1.DataTypes.STRING(4), allowNull: true
    },
    businessUnitName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    uniqueKey: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: true
    },
    version: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 1
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE, allowNull: false
    },
    modifiedBy: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    modifiedAt: {
        type: sequelize_1.DataTypes.DATE, allowNull: true
    },
    transactionId: {
        type: sequelize_1.DataTypes.STRING(255), allowNull: true
    },
    persistedDate: {
        type: sequelize_1.DataTypes.DATE, allowNull: true
    },
    dataStoreTime: {
        type: sequelize_1.DataTypes.DATE, allowNull: true
    },
    sapMssqlSinkTime: {
        type: sequelize_1.DataTypes.DATE, allowNull: true
    },
}, {
    tableName,
    timestamps: false
});
//# sourceMappingURL=material.model.js.map