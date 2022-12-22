"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerContract = exports.CustomerContractModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
const tableName = "CustomerContract";
exports.CustomerContractModelName = tableName;
exports.CustomerContract = database_1.sequelize.define(tableName, {
    customerContractId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    customerId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    contractNumber: {
        type: sequelize_1.DataTypes.STRING(15), allowNull: false
    },
    parentContractId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    companyId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    companyCode: {
        type: sequelize_1.DataTypes.STRING(4), allowNull: true
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: true
    },
    businessUnitId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    businessUnitCode: {
        type: sequelize_1.DataTypes.STRING(4), allowNull: false
    },
    businessUnitName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: false
    },
    startDate: {
        type: sequelize_1.DataTypes.DATEONLY, allowNull: false
    },
    endDate: {
        type: sequelize_1.DataTypes.DATEONLY, allowNull: false
    },
    customerContractStatus: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    remainingKm: {
        type: sequelize_1.DataTypes.FLOAT, allowNull: true
    },
    remainingTonnage: {
        type: sequelize_1.DataTypes.FLOAT, allowNull: true
    },
    remainingTrip: {
        type: sequelize_1.DataTypes.FLOAT, allowNull: true
    },
    isProject: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    isMonthly: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    isTMS: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    isOvercharge: {
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
    timestamps: false
});
//# sourceMappingURL=customer.constract.model.js.map