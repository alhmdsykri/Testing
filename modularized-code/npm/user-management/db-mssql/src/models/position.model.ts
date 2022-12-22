import { Model, DataTypes, Optional, ModelDefined   } from "sequelize";
import { PositionAttributes  } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PositionCreationAttributes = Optional<PositionAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "Position";
export const PositionModelName: string = tableName;
export const Position: ModelDefined<PositionAttributes, PositionCreationAttributes> = sequelize.define(tableName, {
    positionId: {
      type: DataTypes.STRING, allowNull: false, primaryKey: true,  autoIncrement: true
    },
    applicationId: {
      type: DataTypes.INTEGER, allowNull: false
    },
    name: {
      type: DataTypes.STRING, allowNull: false, unique: true
    },
    status: {
      type: DataTypes.INTEGER, allowNull: false
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
