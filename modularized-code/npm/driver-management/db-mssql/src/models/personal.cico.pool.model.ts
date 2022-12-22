import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalCicoPoolAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalCicoPoolAttributes = Optional<PersonalCicoPoolAttribute, "modifiedBy" | "modifiedAt">;
const tableName: string = "PersonalCicoPool";
export const ModelName: string = tableName;
export const PersonalCicoPool: ModelDefined<PersonalCicoPoolAttribute, PersonalCicoPoolAttributes> = sequelize.define(tableName, {
  personalCicoLocId: {
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
  assignmentLocationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignmentLocationCode: {
    type: DataTypes.STRING(8),
    allowNull: false
  },
  assignmentLocationName: {
    type: DataTypes.STRING(100),
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
  tableName: 'PersonalCicoLoc',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalCicoLoc",
      unique: true,
      fields: [
        { name: "personalCicoLocId" },
      ]
    },
  ]
});
