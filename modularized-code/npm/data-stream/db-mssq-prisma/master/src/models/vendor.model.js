"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = exports.VendorModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
const tableName = "Vendor";
exports.VendorModelName = tableName;
exports.Vendor = database_1.sequelize.define(tableName, {
    vendorId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    vendorCode: {
        type: sequelize_1.DataTypes.STRING(255), allowNull: false
    },
    vendorName: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    isBlocked: {
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
    }
}, {
    tableName,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['vendorCode'],
            name: "UN_vendorCode"
        }
    ]
});
//# sourceMappingURL=vendor.model.js.map