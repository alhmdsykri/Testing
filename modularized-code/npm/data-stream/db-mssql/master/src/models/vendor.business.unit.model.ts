import { DataTypes, Optional, ModelDefined } from "sequelize";
import { VendorBusinessUnitAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type VendorBusinessUnitCreationAttributes = Optional<VendorBusinessUnitAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "VendorBusinessUnit";
export const VendorBusinessUnitModelName: string = tableName;
export const VendorBusinessUnit: ModelDefined<VendorBusinessUnitAttributes, VendorBusinessUnitCreationAttributes> = sequelize.define(tableName, {
  vendorBusinessUnitId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  vendorId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  businessUnitId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  businessUnitCode: {
    type: DataTypes.STRING(4), allowNull: true
  },
  isBlocked: {
    type: DataTypes.BOOLEAN, allowNull: false
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
          fields: ['vendorId', 'businessUnitId'],
          name: "UC_VendorBusinessunit_businessUnitId_vendorId"
      }
    ]
  }
);
