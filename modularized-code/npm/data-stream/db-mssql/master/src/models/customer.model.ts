import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerCreationAttributes = Optional<CustomerAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "Customer";
export const CustomerModelName: string = tableName;
export const Customer: ModelDefined<CustomerAttributes, CustomerCreationAttributes> = sequelize.define(tableName, {
  customerId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  customerCode: {
    type: DataTypes.STRING(50), allowNull: false
  },
  customerName: {
    type: DataTypes.STRING(255), allowNull: false
  },
  customerAddress: {
    type: DataTypes.STRING(1000), allowNull: false
  },
  accountGroupSAP: {
    type: DataTypes.STRING(50), allowNull: false
  },
  isBlocked: {
    type: DataTypes.BOOLEAN, allowNull: true
  },
  isB2B: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  customerLogo: {
    type: DataTypes.STRING(255), allowNull: true
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
    type: DataTypes.DATE, allowNull: false,
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
    type: DataTypes.DATE, allowNull: true,
  },
  dataStoreTime: {
    type: DataTypes.DATE, allowNull: true
  },
  sapMssqlSinkTime: {
    type: DataTypes.DATE, allowNull: true
  }
},
  {
    tableName,
    timestamps: false,
    indexes: [
      {
          unique: true,
          fields: ['customerCode'],
          name: "UN_customerCode"
      }
    ]
  }
);
