"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialItem = exports.MaterialItemModelName = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../private/database");
sequelize_1.DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};
const tableName = "MaterialItem";
exports.MaterialItemModelName = tableName;
exports.MaterialItem = database_1.sequelize.define(tableName, {
    materialItemId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
    },
    materialId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: false
    },
    branchId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    businessUnitId: {
        type: sequelize_1.DataTypes.INTEGER, allowNull: true
    },
    businessUnitCode: {
        type: sequelize_1.DataTypes.STRING(5), allowNull: true
    },
    businessUnitName: {
        type: sequelize_1.DataTypes.STRING(100), allowNull: true
    },
    // status: {
    //   type: DataTypes.INTEGER, allowNull: false
    // },
    // uniqueKey: {
    //   type: DataTypes.STRING(100), allowNull: true
    // },
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
            fields: ['materialId', 'businessUnitId'],
            name: "UC_MaterialItem_materialId_businessUnitId"
        }
    ]
});
//# sourceMappingURL=material.item.model.js.map