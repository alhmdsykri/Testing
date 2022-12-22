import { DataTypes, Optional, ModelDefined } from "sequelize";
import { MCUResultTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type MCUResultTypeAttributes = MCUResultTypeAttribute;
const tableName: string = "MCUTypeResult";

export const ModelName: string = tableName;
export const MCUTypeResult: ModelDefined<MCUResultTypeAttribute, MCUResultTypeAttributes> = sequelize.define(tableName, {
  mcuTypeResultId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  mcuResultTypeDetail: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'MCUTypeResult',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_MCUTypeResult",
      unique: true,
      fields: [
        { name: "mcuTypeResultId" },
      ]
    },
  ]
});
