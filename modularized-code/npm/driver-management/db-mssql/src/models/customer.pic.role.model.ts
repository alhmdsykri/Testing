import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerPICRoleAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerPICRoleAttributes = CustomerPICRoleAttribute;
const tableName: string = "CustomerPICRole";
export const ModelName: string = tableName;
export const CustomerPICRole: ModelDefined<CustomerPICRoleAttribute, CustomerPICRoleAttributes> = sequelize.define(tableName, {
  customerPICRoleId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  personalCustomerPICId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PersonalCustomerPIC',
      key: 'personalCustomerPICId'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userRoleName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'CustomerPICRole',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_CustomerPICRole",
      unique: true,
      fields: [
        { name: "CustomerPICRoleId" },
      ]
    },
  ]
});
