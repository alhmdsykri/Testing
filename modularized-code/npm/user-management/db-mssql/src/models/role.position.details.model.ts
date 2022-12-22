import { DataTypes, Optional, ModelDefined   } from "sequelize";
import { RolePositionDetailsAttributes  } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type RolePermissionCreationAttributes = Optional<RolePositionDetailsAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "RolePositionDetails";
export const RolePositionDetailsDetailsModelName: string = tableName;
export const RolePositionDetailsDetails: ModelDefined<RolePositionDetailsAttributes, RolePermissionCreationAttributes> = sequelize.define(tableName, {
    rolePermissionDetailsId: {
      type: DataTypes.STRING, allowNull: false, primaryKey: true,  autoIncrement: true
    },
    roleId: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    positionId: {
      type: DataTypes.INTEGER, allowNull: false, unique: true
    },
    companyId: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    companyName: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    businessUnitId: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    businessUnitName: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    branchId: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    branchName: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    locationId: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    locationName: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    status: {
      type: DataTypes.INTEGER, allowNull: false, defaultValue: 0
    },
    createdBy: {
      type: DataTypes.STRING, allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE, allowNull: false
    },
    modifiedBy: {
      type: DataTypes.STRING, allowNull: true
    },
    modifiedAt: {
      type: DataTypes.DATE, allowNull: true
    },
    uniqueKey: {
      type: DataTypes.STRING, allowNull: false, unique: true
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
