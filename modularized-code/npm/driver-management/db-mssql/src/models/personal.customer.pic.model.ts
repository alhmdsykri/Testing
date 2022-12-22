import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalCustomerPICAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalCustomerPICAttributes = PersonalCustomerPICAttribute;
const tableName: string = "PersonalCustomerPIC";
export const ModelName: string = tableName;
export const PersonalCustomerPIC: ModelDefined<PersonalCustomerPICAttribute, PersonalCustomerPICAttributes> = sequelize.define(tableName, {
  personalCustomerPICId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  personalDataId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PersonalData',
      key: 'personalDataId'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userName: {
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
  tableName: 'PersonalCustomerPIC',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalCustomerPIC",
      unique: true,
      fields: [
        { name: "personalCustomerPICId" },
      ]
    },
  ]
});
