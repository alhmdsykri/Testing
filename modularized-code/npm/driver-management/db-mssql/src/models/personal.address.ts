import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalAddressAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalAddressAttributes = PersonalAddressAttribute;
const tableName: string = "PersonalAddress";
export const ModelName: string = tableName;
export const PersonalAddress: ModelDefined<PersonalAddressAttribute, PersonalAddressAttributes> = sequelize.define(tableName, {
  personalAddressId: {
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
  addressTypeCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'AddressType',
      key: 'addressTypeCode'
    }
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'City',
      key: 'cityId'
    }
  },
  addressDetail: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  contactName: {
    type: DataTypes.STRING(150),
    allowNull: true
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
  tableName: 'PersonalAddress',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalAddressId",
      unique: true,
      fields: [
        { name: "personalAddressId" },
      ]
    },
  ]
});
