import { DataTypes, Optional, ModelDefined } from "sequelize";
import { AbilityAttribute } from "./interfaces";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type AbilityAttributes = AbilityAttribute;
const tableName: string = "Ability";
export const ModelName: string = tableName;
export const Ability: ModelDefined<AbilityAttribute, AbilityAttributes> = sequelize.define(tableName, {
  abilityId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  abilityTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'AbilityType',
      key: 'abilityTypeId'
    }
  },
  abilityName: {
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
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Ability',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_ABILITY",
      unique: true,
      fields: [
        { name: "abilityId" },
      ]
    },
  ]
});
