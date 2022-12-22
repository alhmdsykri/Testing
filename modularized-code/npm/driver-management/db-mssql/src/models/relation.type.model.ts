import { DataTypes, Optional, ModelDefined } from "sequelize";
import { RelationTypeAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type RelationTypeAttributes = RelationTypeAttribute;
const tableName: string = "RelationType";
export const ModelName: string = tableName;
export const RelationType: ModelDefined<RelationTypeAttribute, RelationTypeAttributes> = sequelize.define(tableName, {
  relationTypeCode: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  RelationTypeName: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'RelationType',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_RelationType",
      unique: true,
      fields: [
        { name: "RelationTypeId" },
      ]
    },
  ]
});
