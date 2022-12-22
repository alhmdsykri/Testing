import { DataTypes, Optional, ModelDefined } from "sequelize";
import { EducationTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type EducationTypeAttributes = EducationTypeAttribute;
const tableName: string = "EducationType";
export const ModelName: string = tableName;
export const EducationType: ModelDefined<EducationTypeAttribute, EducationTypeAttributes> = sequelize.define(tableName, {
  educationTypeId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  educationTypeCode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    primaryKey: true
  },
  educationName: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'EducationType',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_EducationTypeCode",
      unique: true,
      fields: [
        { name: "educationTypeId" },
      ]
    },
  ]
});
