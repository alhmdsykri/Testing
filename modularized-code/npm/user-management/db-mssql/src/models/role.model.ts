import { DataTypes, Optional, ModelDefined } from "sequelize";
import { RoleAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type RoleCreationAttributes = Optional<RoleAttributes, "modifiedBy" | "modifiedAt" | "isSuperAdmin">;
// type RoleCreationAttributes = {};
const tableName: string = "Role";
export const RoleModelName: string = tableName;
export const Role: ModelDefined<RoleAttributes, RoleCreationAttributes> = sequelize.define(tableName, {
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  isSuperAdmin: {
    type: DataTypes.BOOLEAN, allowNull: true
  },
  createdBy: {
    type: DataTypes.STRING(60), allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE, allowNull: false
  },
  modifiedBy: {
    type: DataTypes.STRING(60), allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE, allowNull: true
  },
  uniqueKey: {
    type: DataTypes.STRING(100), allowNull: false, unique: true
  },
  version: {
    type: DataTypes.INTEGER, allowNull: false, defaultValue: 1
  }
},
  {
    tableName,
    timestamps: false
  }
);
