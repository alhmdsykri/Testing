import { DataTypes, Optional, ModelDefined } from "sequelize";
import { VendorAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type VendorCreationAttributes = Optional<VendorAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "Vendor";
export const VendorModelName: string = tableName;
export const Vendor: ModelDefined<VendorAttributes, VendorCreationAttributes> = sequelize.define(tableName, {
  vendorId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  vendorCode: {
    type: DataTypes.STRING(255), allowNull: false
  },
  vendorName: {
    type: DataTypes.STRING(50), allowNull: false
  },
  isBlocked: {
    type: DataTypes.STRING(100), allowNull: true
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
  }
},
  {
    tableName,
    timestamps: false,
    indexes: [
      {
          unique: true,
          fields: ['vendorCode'],
          name: "UN_vendorCode"
      }
    ]
  }
);
