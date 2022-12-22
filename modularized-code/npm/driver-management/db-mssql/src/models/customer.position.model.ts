import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerPositionAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerPositionAttributes = CustomerPositionAttribute;
const tableName: string = "CustomerPosition";
export const ModelName: string = tableName;
export const CustomerPosition: ModelDefined<CustomerPositionAttribute, CustomerPositionAttributes> = sequelize.define(tableName, {
  customerPositionId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  customerPositionName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
}, {
  tableName: 'CustomerPosition',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_CustomerPosition",
      unique: true,
      fields: [
        { name: "CustomerPosition" },
      ]
    },
  ]
});
