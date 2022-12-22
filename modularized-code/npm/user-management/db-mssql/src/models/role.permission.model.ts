import { Model, DataTypes, Optional, ModelDefined   } from "sequelize";
import { RolePermissionAttributes  } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type RolePermissionCreationAttributes = Optional<RolePermissionAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "RolePermission";
export const RolePermissionModelName: string = tableName;
export const RolePermission: ModelDefined<RolePermissionAttributes, RolePermissionCreationAttributes> = sequelize.define(tableName, {
    rolePermissionId: {
      type: DataTypes.INTEGER, allowNull: false, primaryKey: true,  autoIncrement: true
    },
    roleId: {
      type: DataTypes.INTEGER, allowNull: false
    },
    permissionId: {
      type: DataTypes.INTEGER, allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    visible: {
      type: DataTypes.INTEGER, allowNull: false
    },
    enable: {
      type: DataTypes.INTEGER, allowNull: false
    },
    active: {
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
      type: DataTypes.STRING(100), allowNull: false, unique: true
    },
    version: {
      type: DataTypes.INTEGER, allowNull: false, defaultValue: 1
    }
  },
  {
    tableName,
    timestamps: false,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  }
);
