import { DataTypes, Optional, ModelDefined } from "sequelize";
import { IdentityTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type IdentityTypeAttributes = IdentityTypeAttribute;
const tableName: string = "IdentityType";

export const ModelName: string = tableName;
export const IdentityType: ModelDefined<IdentityTypeAttribute, IdentityTypeAttributes> = sequelize.define(tableName, {
  identityTypeId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  identityTypeName: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'IdentityType',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_IdentityType",
      unique: true,
      fields: [
        { name: "identityTypeId" },
      ]
    },
  ]
});
