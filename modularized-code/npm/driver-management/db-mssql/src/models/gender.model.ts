import { DataTypes, Optional, ModelDefined } from "sequelize";
import { GenderAttribute } from "./interfaces";
import { sequelize } from "../private/database";

type GenderAttributes = GenderAttribute;
const tableName: string = "Gender";
export const ModelName: string = tableName;
export const Gender: ModelDefined<GenderAttribute, GenderAttributes> = sequelize.define(tableName, {
  genderId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  genderDescription: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'Gender',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_Gender",
      unique: true,
      fields: [
        { name: "genderId" },
      ]
    },
  ]
});
