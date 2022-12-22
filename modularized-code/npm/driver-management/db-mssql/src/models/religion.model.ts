import { DataTypes, Optional, ModelDefined } from "sequelize";
import { ReligionAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type ReligionAttributes = ReligionAttribute;
const tableName: string = "Religion";
export const ModelName: string = tableName;
export const Religion: ModelDefined<ReligionAttribute, ReligionAttributes> = sequelize.define(tableName, {
  religionId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  religionName: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'Religion',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_Religion",
      unique: true,
      fields: [
        { name: "ReligionId" },
      ]
    },
  ]
});
