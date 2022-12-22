import { DataTypes, Optional, ModelDefined } from "sequelize";
import { BankAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type BankAttributes = BankAttribute;
const tableName: string = "Bank";
export const ModelName: string = tableName;
export const Bank: ModelDefined<BankAttribute, BankAttributes> = sequelize.define(tableName, {
  bankId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  bankName: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'Bank',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_Bank",
      unique: true,
      fields: [
        { name: "bankId" },
      ]
    },
  ]
});
