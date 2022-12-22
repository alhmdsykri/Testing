import { DataTypes, Optional, ModelDefined } from "sequelize";
import { MaterialItemAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type MaterialItemCreationAttributes = Optional<MaterialItemAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "MaterialItem";
export const MaterialItemModelName: string = tableName;
export const MaterialItem: ModelDefined<MaterialItemAttributes, MaterialItemCreationAttributes> = sequelize.define(tableName, {
 materialItemId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  materialId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  branchId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  businessUnitId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  businessUnitCode: {
    type: DataTypes.STRING(5), allowNull: true
  },
  businessUnitName: {
    type: DataTypes.STRING(100), allowNull: true
  },
  // status: {
  //   type: DataTypes.INTEGER, allowNull: false
  // },
  // uniqueKey: {
  //   type: DataTypes.STRING(100), allowNull: true
  // },
  version: {
    type: DataTypes.INTEGER, allowNull: false, defaultValue: 1
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
  transactionId: {
    type: DataTypes.STRING(255), allowNull: true
  },
  persistedDate: {
    type: DataTypes.DATE, allowNull: true
  },
  dataStoreTime: {
    type: DataTypes.DATE, allowNull: true
  },
  sapMssqlSinkTime: {
    type: DataTypes.DATE, allowNull: true
  },
},
  {
    tableName,
    timestamps: false,
    indexes: [
      {
          unique: true,
          fields: ['materialId', 'businessUnitId'],
          name: "UC_MaterialItem_materialId_businessUnitId"
      }
    ]
  }
);
