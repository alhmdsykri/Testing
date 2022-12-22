import { DataTypes, Optional, ModelDefined } from "sequelize";
import { ProvinceAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type ProvinceAttributes = ProvinceAttribute;
const tableName: string = "Province";
export const ModelName: string = tableName;
export const Province: ModelDefined<ProvinceAttribute, ProvinceAttributes> = sequelize.define(tableName, {
  provinceId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Country',
      key: 'countryId'
    }
  },
  provinceName: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'Province',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_Province",
      unique: true,
      fields: [
        { name: "provinceId" },
      ]
    },
  ]
});
