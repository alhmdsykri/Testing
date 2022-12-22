"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerContractItem = exports.CustomerContractItemModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
const tableName = "CustomerContractItem";
exports.CustomerContractItemModelName = tableName;
exports.CustomerContractItem = database_1.sequelize.define(tableName, {
    customerContractItemId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    customerContractId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    materialId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    UOMCode: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    branchId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    branchCode: {
        type: sequelize_1.DataTypes.STRING(4), allowNull: false
    },
    branchName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: false
    },
    lineItemNumber: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    numberOfDriver: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    helperIncluded: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    reportIncluded: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    UJPIncluded: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    fuel: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    channelType: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    tollAndParking: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    driverOrRider: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    crew: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    coverageArea: {
        type: sequelize_1.DataTypes.STRING(10), allowNull: false
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE, allowNull: false
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE, allowNull: false
    },
    isDedicated: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    isWithDriver: {
        type: sequelize_1.DataTypes.BOOLEAN, allowNull: false
    },
    isActive: {
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
    }
    // ,
    // transactionId: {
    //   type: DataTypes.STRING(255), allowNull: true
    // },
    // persistedDate: {
    //   type: DataTypes.DATE, allowNull: true
    // },
    // dataStoreTime: {
    //   type: DataTypes.DATE, allowNull: true
    // },
    // sapMssqlSinkTime: {
    //   type: DataTypes.DATE, allowNull: true
    // },
}, {
    tableName,
    timestamps: false
});
//# sourceMappingURL=customer.contract.item.model.js.map