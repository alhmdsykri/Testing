import { DataTypes, Optional, ModelDefined } from "sequelize";
import { MaritalStatusAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type MaritalStatusAttributes = MaritalStatusAttribute;
const tableName: string = "MaritalStatus";

export const ModelName: string = tableName;
export const MaritalStatus: ModelDefined<
  MaritalStatusAttribute,
  MaritalStatusAttributes
> = sequelize.define(
  tableName,
  {
    maritalStatusId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    maritalStatusDescription: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
  },
  {
    tableName: "MaritalStatus",
    schema: "dbo",
    timestamps: false,
    indexes: [
      {
        name: "PK_MaritalStatus",
        unique: true,
        fields: [{ name: "maritalStatusId" }],
      },
    ],
  }
);
