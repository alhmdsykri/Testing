import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CityAttribute } from "./interfaces";
import { sequelize } from "../private/database";

type CityAttributes = CityAttribute;
const tableName: string = "City";
export const ModelName: string = tableName;
export const City: ModelDefined<CityAttribute, CityAttributes> = sequelize.define(tableName, {
  cityId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  provinceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Province',
      key: 'provinceId'
    }
  },
  cityName: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'City',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_City",
      unique: true,
      fields: [
        { name: "cityId" },
      ]
    },
  ]
});
