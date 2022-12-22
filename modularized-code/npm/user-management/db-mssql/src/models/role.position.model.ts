import { Model, DataTypes, Optional, ModelDefined } from "sequelize";
import { RolePositionAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type RolePositionCreationAttributes = Optional<RolePositionAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "RolePosition";
export const RolePositionModelName: string = tableName;
export const RolePosition: ModelDefined<RolePositionAttributes, RolePositionCreationAttributes> = sequelize.define(tableName, {
  rolePositionId: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true
  },
  roleId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  companyId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  companyCode: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  businessUnitId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  businessUnitCode: {
    type: DataTypes.STRING(100), allowNull: false
  },
  businessUnitName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  branchId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  branchCode: {
    type: DataTypes.STRING(100), allowNull: false
  },
  branchName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  locationId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  locationCode: {
    type: DataTypes.STRING(100), allowNull: false
  },
  locationName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
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
    collate: 'utf8_general_ci',
    indexes: [
      {
        unique: true,
        fields: ['companyId', 'businessUnitId', 'branchId', 'locationId']
      }
    ]
  }
);
