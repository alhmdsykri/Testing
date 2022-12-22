import { DataTypes, Optional, ModelDefined } from "sequelize";
import { ApplicationAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type ApplicationCreationAttributes = Optional<ApplicationAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "Application";
export const ApplicationModelName: string = tableName;
export const Application: ModelDefined<ApplicationAttributes, ApplicationCreationAttributes> = sequelize.define(tableName, {
  applicationId: {
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
