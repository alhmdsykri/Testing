import { DataTypes, Optional, ModelDefined } from "sequelize";
import { AddressTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type AddressTypeAttributes = AddressTypeAttribute;
const tableName: string = "AddressType";
export const ModelName: string = tableName;
export const AddressType: ModelDefined<AddressTypeAttribute, AddressTypeAttributes> = sequelize.define(tableName, {
  addressTypeCode: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  addressTypeName: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'AddressType',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_RelationTypeCode",
      unique: true,
      fields: [
        { name: "addressTypeCode" },
      ]
    },
  ]
});
