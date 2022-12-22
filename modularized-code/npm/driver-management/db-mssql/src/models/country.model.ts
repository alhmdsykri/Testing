import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CountryAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type CountryAttributes = CountryAttribute;
const tableName: string = "Country";
export const ModelName: string = tableName;
export const Country: ModelDefined<CountryAttribute, CountryAttributes> = sequelize.define(tableName, {
  countryId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  countryName: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'Country',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_CountryId",
      unique: true,
      fields: [
        { name: "countryId" },
      ]
    },
  ]
});
