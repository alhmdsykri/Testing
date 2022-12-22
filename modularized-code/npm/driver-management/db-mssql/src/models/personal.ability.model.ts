import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalAbilityAttribute } from "./interfaces";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalAbilityAttributes = PersonalAbilityAttribute;
const tableName: string = "PersonalAbility";
export const ModelName: string = tableName;
export const PersonalAbility: ModelDefined<PersonalAbilityAttribute, PersonalAbilityAttributes> = sequelize.define(tableName, {
  personalAbilityId: {
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
  abilityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ability',
      key: 'abilityId'
    }
  },
  score: {
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
}, {
  tableName: 'PersonalAbility',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PERSONAL_ABILITY",
      unique: true,
      fields: [
        { name: "personalAbilityId" },
      ]
    },
  ]
});
