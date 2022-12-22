import { DataTypes, Optional, ModelDefined } from "sequelize";
import { MaterialAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type MaterialCreationAttributes = Optional<MaterialAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "Material";
export const MaterialModelName: string = tableName;
export const Material: ModelDefined<MaterialAttributes, MaterialCreationAttributes> = sequelize.define(tableName, {
  materialId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  serviceTypeId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  productId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  UOMCode: {
    type: DataTypes.INTEGER, allowNull: true
  },
  materialCode: {
    type: DataTypes.STRING(50), allowNull: false
  },
  materialName: {
    type: DataTypes.STRING(100), allowNull: true
  },
  vehicleTypeId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  vehicleTypeCode: {
    type: DataTypes.STRING(5), allowNull: false
  },
  vehicleTypeName: {
    type: DataTypes.STRING(50), allowNull: false
  },
  rentalDuration: {
    type: DataTypes.INTEGER, allowNull: false
  },
  rentalDurationType: {
    type: DataTypes.STRING(10), allowNull: false
  },
  isSLITrucking: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  businessUnitId: {
    type: DataTypes.INTEGER, allowNull: true
  },
  businessUnitCode: {
    type: DataTypes.STRING(4), allowNull: true
  },
  businessUnitName: {
    type: DataTypes.STRING(100), allowNull: true
  },
  status: {
    type: DataTypes.INTEGER, allowNull: false
  },
  uniqueKey: {
    type: DataTypes.STRING(100), allowNull: true
  },
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
    timestamps: false
  }
);
