import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CoordinatorPICRoleAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CoordinatorPICRoleAttributes = CoordinatorPICRoleAttribute;
const tableName: string = "CoordinatorPICRole";
export const ModelName: string = tableName;
export const CoordinatorPICRole: ModelDefined<CoordinatorPICRoleAttribute, CoordinatorPICRoleAttributes> = sequelize.define(tableName, {
  coordinatorPICRoleId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  personalCoordinatorPICId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PersonalCoordinatorPIC',
      key: 'personalCoordinatorPICId'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userRoleName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  modifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'CoordinatorPICRole',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_CoordinatorPICRole",
      unique: true,
      fields: [
        { name: "CoordinatorPICRoleId" },
      ]
    },
  ]
});
