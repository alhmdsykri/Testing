import { Model, DataTypes, Optional, ModelDefined } from "sequelize";
import { PermissionAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PermissionCreationAttributes = Optional<PermissionAttributes, "modifiedBy" | "modifiedAt">;
// type RoleCreationAttributes = {};
const tableName: string = "Permission";
export const PermissionModelName: string = tableName;
export const Permission: ModelDefined<PermissionAttributes, PermissionCreationAttributes> = sequelize.define(tableName, {
  permissionId: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true
  },
  applicationId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  featureName: {
    type: DataTypes.STRING(60), allowNull: false
  },
  parentFeatureId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  type: {
    type: DataTypes.INTEGER, allowNull: false
  },
  attributeId: {
    type: DataTypes.STRING, allowNull: false
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

