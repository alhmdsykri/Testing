import { DataTypes, Optional, ModelDefined } from "sequelize";
import { AbilityTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type AbilityTypeAttributes = AbilityTypeAttribute;
const tableName: string = "AbilityType";

export const ModelName: string = tableName;
export const AbilityType: ModelDefined<AbilityTypeAttribute, AbilityTypeAttributes> = sequelize.define(tableName, {
  abilityTypeId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  abilityTypeName: {
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
  tableName: 'AbilityType',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_ABILITY_TYPE",
      unique: true,
      fields: [
        { name: "abilityTypeId" },
      ]
    },
  ]
});
