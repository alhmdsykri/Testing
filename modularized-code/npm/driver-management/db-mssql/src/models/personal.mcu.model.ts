import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalMCUAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalMCUAttributes = Optional<PersonalMCUAttribute, "modifiedBy" | "modifiedAt">;
const tableName: string = "PersonalMCU";
export const ModelName: string = tableName;
export const PersonalMCU: ModelDefined<PersonalMCUAttribute, PersonalMCUAttributes> = sequelize.define(tableName, {
  personalMCUId: {
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
  mcuTypeResultId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'MCUTypeResult',
      key: 'mcuTypeResultId'
    }
  },
  healthFacility: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  mcuDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  mcuExpirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  mcuStatus: {
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
  tableName: 'PersonalMCU',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalMCU",
      unique: true,
      fields: [
        { name: "personalMCUId" },
      ]
    },
  ]
});
