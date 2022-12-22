"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = exports.CustomerModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
const tableName = "Customer";
exports.CustomerModelName = tableName;
exports.Customer = database_1.sequelize.define(tableName, {
    customerId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    customerCode: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    customerName: {
        type: sequelize_1.DataTypes.STRING(255), allowNull: false
    },
    customerAddress: {
        type: sequelize_1.DataTypes.STRING(1000), allowNull: false
    },
    accountGroupSAP: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    isBlocked: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: true
    },
    isB2B: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    customerLogo: {
        type: sequelize_1.DataTypes.STRING(255), allowNull: true
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
        type: sequelize_1.DataTypes.DATE, allowNull: false,
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
        type: sequelize_1.DataTypes.DATE, allowNull: true,
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
            fields: ['customerCode'],
            name: "UN_customerCode"
        }
    ]
});
//# sourceMappingURL=customer.model.js.map