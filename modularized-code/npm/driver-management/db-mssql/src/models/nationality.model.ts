import { DataTypes, Optional, ModelDefined } from "sequelize";
import { NationalityAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type NationalityAttributes = NationalityAttribute;
const tableName: string = "Nationality";
export const ModelName: string = tableName;
export const Nationality: ModelDefined<NationalityAttribute, NationalityAttributes> = sequelize.define(tableName, {
  nationalityId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  nationalityName: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'Nationality',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_Nationality",
      unique: true,
      fields: [
        { name: "nationalityId" },
      ]
    },
  ]
});
