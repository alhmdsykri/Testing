import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerContactAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerContactCreationAttributes = Optional<CustomerContactAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "CustomerContact";
export const CustomerContactModelName: string = tableName;
export const CustomerContact: ModelDefined<CustomerContactAttributes, CustomerContactCreationAttributes> = sequelize.define(tableName, {
  customerContactId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  customerId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  customerContactCode: {
    type: DataTypes.STRING(50), allowNull: false
  },
  contactName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20), allowNull: false
  },
  email: {
    type: DataTypes.STRING(50), allowNull: false
  },
  position: {
    type: DataTypes.STRING(50), allowNull: true
  },
  department: {
    type: DataTypes.STRING(50), allowNull: true
  },
  remarks: {
    type: DataTypes.STRING(150), allowNull: true
  },
  isPIC: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  function: {
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
  },
},
  {
    tableName,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['customerId', 'customerContactCode'],
        name: "UC_CustomerContact_customerId_customerContactCode"
      }
    ]
  }
);
