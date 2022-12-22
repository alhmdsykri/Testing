import { DataTypes, Optional, ModelDefined } from "sequelize";
import { UserRoleAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type UserRoleCreationAttributes = Optional<UserRoleAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "UserRole";
export const UserRoleModelName: string = tableName;
export const UserRole: ModelDefined<UserRoleAttributes, UserRoleCreationAttributes> = sequelize.define(tableName, {
  userRoleId: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER, allowNull: false, unique: true
  },
  roleId: {
    type: DataTypes.INTEGER, allowNull: false, unique: true
  },
  status: {
    type: DataTypes.INTEGER, allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER, allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE, allowNull: false
  },
  modifiedBy: {
    type: DataTypes.INTEGER, allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE, allowNull: true
  },
  uniqueKey: {
    type: DataTypes.STRING, allowNull: false, unique: true
  },
  version: {
    type: DataTypes.INTEGER, allowNull: true, defaultValue: 1
  }
},
  {
    tableName,
    timestamps: false
  }
);
