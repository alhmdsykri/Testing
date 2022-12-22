import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalIdentityAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalIdentityAttributes = Optional<PersonalIdentityAttribute, "modifiedBy" | "modifiedAt">;
const tableName: string = "PersonalIdentity";
export const ModelName: string = tableName;
export const PersonalIdentity: ModelDefined<PersonalIdentityAttribute, PersonalIdentityAttributes> = sequelize.define(tableName, {
  personalIdentityId: {
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
  identityTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'IdentityType',
      key: 'identityTypeId'
    }
  },
  identityAccountNumber: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  identityAccountName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  identityValidTo: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  identityStatus: {
    type: DataTypes.INTEGER,
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
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'PersonalIdentity',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalIdentity",
      unique: true,
      fields: [
        { name: "personalIdentityId" },
      ]
    },
  ]
});
