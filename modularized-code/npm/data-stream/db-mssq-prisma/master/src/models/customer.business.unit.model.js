"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerBusinessUnit = exports.CustomerBusinessUnitModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
const tableName = "CustomerBusinessUnit";
exports.CustomerBusinessUnitModelName = tableName;
exports.CustomerBusinessUnit = database_1.sequelize.define(tableName, {
    customerBusinessUnit: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    customerId: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    businessUnitId: {
        type: sequelize_1.DataTypes.STRING(255), allowNull: false
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
            fields: ['customerId', 'businessUnitId'],
            name: "UC_CustomerBusinessUnit_customerId_businessUnitId"
        }
    ]
});
//# sourceMappingURL=customer.business.unit.model.js.map