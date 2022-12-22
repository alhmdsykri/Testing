"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerContact = exports.CustomerContactModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
const tableName = "CustomerContact";
exports.CustomerContactModelName = tableName;
exports.CustomerContact = database_1.sequelize.define(tableName, {
    customerContactId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    customerId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    customerContactCode: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    contactName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: false
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING(20), allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: false
    },
    position: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: true
    },
    department: {
        type: sequelize_1.DataTypes.STRING(50), allowNull: true
    },
    remarks: {
        type: sequelize_1.DataTypes.STRING(150), allowNull: true
    },
    isPIC: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    function: {
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
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['customerId', 'customerContactCode'],
            name: "UC_CustomerContact_customerId_customerContactCode"
        }
    ]
});
//# sourceMappingURL=customer.contact.model.js.map