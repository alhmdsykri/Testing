import { DataTypes, Optional, ModelDefined } from "sequelize";
import { ApprovalLevelAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type ApprovalLevelCreationAttributes = Optional<ApprovalLevelAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "ApprovalLevel";
export const ApprovalLevelModelName: string = tableName;
export const ApprovalLevel: ModelDefined<ApprovalLevelAttributes, ApprovalLevelCreationAttributes> = sequelize.define(tableName, {
  approvalLevelId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  approvalTopicId: {
    type: DataTypes.INTEGER, allowNull: false, unique: true
  },
  name: {
    type: DataTypes.STRING, allowNull: true
  },
  description: {
    type: DataTypes.STRING, allowNull: true
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
  version: {
    type: DataTypes.INTEGER, allowNull: false, defaultValue: 1
  }
},
  {
    tableName,
    timestamps: false
  }
);
