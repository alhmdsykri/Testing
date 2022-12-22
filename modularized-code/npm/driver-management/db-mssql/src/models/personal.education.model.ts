import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalEducationAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalEducationAttributes = PersonalEducationAttribute;
const tableName: string = "PersonalEducation";
export const ModelName: string = tableName;
export const PersonalEducation: ModelDefined<PersonalEducationAttribute, PersonalEducationAttributes> = sequelize.define(tableName, {
  personalEducationId: {
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
  educationTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'EducationType',
      key: 'educationTypeId'
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  institute: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  branchOfStudy: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING('MAX'),
    allowNull: false
  },
  finalGrade: {
    type: DataTypes.TINYINT(),
    allowNull: false
  },
  certificateFile: {
    type: DataTypes.STRING('MAX'),
    allowNull: false
  },
  certificateExpirationDate: {
    type: DataTypes.DATE,
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
  tableName: 'PersonalEducation',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalEducationId",
      unique: true,
      fields: [
        { name: "personalEducationId" },
      ]
    },
  ]
});
