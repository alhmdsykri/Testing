import { DataTypes, Optional, ModelDefined } from "sequelize";
import { EmployeeStatusAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type EmployeeStatusAttributes = EmployeeStatusAttribute;
const tableName: string = "EmployeeStatus";
export const ModelName: string = tableName;
export const EmployeeStatus: ModelDefined<EmployeeStatusAttribute, EmployeeStatusAttributes> = sequelize.define(tableName, {
  employeeStatusId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }, 
  employeeStatusDescription: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'EmployeeStatus',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_EmployeeStatus",
      unique: true,
      fields: [
        { name: "employeeStatusId" },
      ]
    },
  ]
});
