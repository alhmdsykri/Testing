"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorBusinessUnit = exports.VendorBusinessUnitModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
const tableName = "VendorBusinessUnit";
exports.VendorBusinessUnitModelName = tableName;
exports.VendorBusinessUnit = database_1.sequelize.define(tableName, {
    vendorBusinessUnitId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    vendorId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    businessUnitId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    businessUnitCode: {
        type: sequelize_1.DataTypes.STRING(4), allowNull: true
    },
    isBlocked: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
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
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['vendorId', 'businessUnitId'],
            name: "UC_VendorBusinessunit_businessUnitId_vendorId"
        }
    ]
});
//# sourceMappingURL=vendor.business.unit.model.js.map