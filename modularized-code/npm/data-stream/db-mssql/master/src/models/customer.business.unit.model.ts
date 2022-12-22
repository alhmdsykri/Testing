import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerBusinessUnitAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerBusinessUnitCreationAttributes = Optional<CustomerBusinessUnitAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "CustomerBusinessUnit";
export const CustomerBusinessUnitModelName: string = tableName;
export const CustomerBusinessUnit: ModelDefined<CustomerBusinessUnitAttributes, CustomerBusinessUnitCreationAttributes> = sequelize.define(tableName, {
  customerBusinessUnit: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  customerId: {
    type: DataTypes.STRING(50), allowNull: false
  },
  businessUnitId: {
    type: DataTypes.STRING(255), allowNull: false
  },
  status: {
    type: DataTypes.INTEGER, allowNull: false
  },
  uniqueKey: {
    type: DataTypes.STRING(100), allowNull: true
  },
  version: {
    type: DataTypes.INTEGER, allowNull: false, defaultValue: 1
  },
  createdBy: {
    type: DataTypes.INTEGER, allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE, allowNull: false
  },
  modifiedBy: {
    type: DataTypes.INTEGER, allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE, allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING(255), allowNull: true
  },
  persistedDate: {
    type: DataTypes.DATE, allowNull: true
  },
  dataStoreTime: {
    type: DataTypes.DATE, allowNull: true
  },
  sapMssqlSinkTime: {
    type: DataTypes.DATE, allowNull: true
  },
},
  {
    tableName,
    timestamps: false,
    indexes: [
      {
          unique: true,
          fields: ['customerId', 'businessUnitId'],
          name: "UC_CustomerBusinessUnit_customerId_businessUnitId"
      }
    ]
  }
);
