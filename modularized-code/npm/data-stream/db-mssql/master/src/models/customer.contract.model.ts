import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerContractAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerContractCreationAttributes = Optional<CustomerContractAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "CustomerContract";
export const CustomerContractModelName: string = tableName;
export const CustomerContract: ModelDefined<CustomerContractAttributes, CustomerContractCreationAttributes> = sequelize.define(tableName, {
  customerContractId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  customerId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  contractNumber: {
    type: DataTypes.STRING(15), allowNull: false
  },
  parentContractId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  companyId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  companyCode: {
    type: DataTypes.STRING(4), allowNull: true
  },
  companyName: {
    type: DataTypes.STRING(100), allowNull: true
  },
  businessUnitId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  businessUnitCode: {
    type: DataTypes.STRING(4), allowNull: false
  },
  businessUnitName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY, allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY, allowNull: false
  },
  customerContractStatus: {
    type: DataTypes.INTEGER, allowNull: false
  },
  remainingKm: {
    type: DataTypes.FLOAT, allowNull: true
  },
  remainingTonnage: {
    type: DataTypes.FLOAT, allowNull: true
  },
  remainingTrip: {
    type: DataTypes.FLOAT, allowNull: true
  },
  isProject: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  isMonthly: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  isTMS: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  isOvercharge: {
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
    timestamps: false
    // ,
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['customerId', 'customerContactCode'],
    //     name: "UC_CustomerContact_customerId_customerContactCode"
    //   }
    // ]
  }
);
