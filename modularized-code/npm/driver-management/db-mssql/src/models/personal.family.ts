import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalFamilyAttribute } from "./interfaces";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalFamilyAttributes = PersonalFamilyAttribute;
const tableName: string = "PersonalFamily";
export const ModelName: string = tableName;
export const PersonalFamily: ModelDefined<PersonalFamilyAttribute, PersonalFamilyAttributes> = sequelize.define(tableName, {
  personalFamilyId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  relationTypeCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'RelationType',
      key: 'relationTypeCode'
    }
  },
  personalDataId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PersonalData',
      key: 'personalDataId'
    }
  },
  genderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Gender',
      key: 'genderId'
    }
  },
  FullName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  placeOfBirth: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  identityNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profession: {
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
  tableName: 'PersonalFamily',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_personalFamilyId",
      unique: true,
      fields: [
        { name: "personalFamilyId" },
      ]
    },
  ]
});
