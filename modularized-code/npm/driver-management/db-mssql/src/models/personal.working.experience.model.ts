import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalWorkingExperienceAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalWorkingExperienceAttributes = PersonalWorkingExperienceAttribute;
const tableName: string = "PersonalWorkingExperience";
export const ModelName: string = tableName;
export const PersonalWorkingExperience: ModelDefined<PersonalWorkingExperienceAttribute, PersonalWorkingExperienceAttributes> = sequelize.define(tableName, {
  personalWorkingExperienceId: {
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
  companyName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  workingStart: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  workingEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  unitType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  isDriverExperience: {
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
  },
  vehicleTypeCode: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  vehicleTypeName: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'PersonalWorkingExperience',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalWorkingExperience",
      unique: true,
      fields: [
        { name: "personalWorkingExperienceId" },
      ]
    },
  ]
});
