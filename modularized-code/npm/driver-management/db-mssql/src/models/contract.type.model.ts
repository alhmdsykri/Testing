import { DataTypes, Optional, ModelDefined } from "sequelize";
import { ContractTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type ContractTypeAttributes = ContractTypeAttribute;
const tableName: string = "ContractType";
export const ModelName: string = tableName;
export const ContractType: ModelDefined<ContractTypeAttribute, ContractTypeAttributes> = sequelize.define(tableName, {
  contractTypeCode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    primaryKey: true
  },
  contractTypeDescription: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'ContractType',
  schema: 'dbo',
  timestamps: false,
  createdAt: false,
  updatedAt: false,
  indexes: [
    {
      name: "PK_ContractType",
      unique: true,
      fields: [
        { name: "contractTypeCode" },
      ]
    },
  ]
});
