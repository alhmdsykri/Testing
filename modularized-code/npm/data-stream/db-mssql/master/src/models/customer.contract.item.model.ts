import { DataTypes, Optional, ModelDefined } from "sequelize";
import { CustomerContractItemAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type CustomerContractItemCreationAttributes = Optional<CustomerContractItemAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "CustomerContractItem";
export const CustomerContractItemModelName: string = tableName;
export const CustomerContractItem: ModelDefined<CustomerContractItemAttributes, CustomerContractItemCreationAttributes> = sequelize.define(tableName, {
  customerContractItemId: {
    type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true
  },
  customerContractId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  materialId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  UOMCode: {
    type: DataTypes.STRING(10), allowNull: false
  },
  branchId: {
    type: DataTypes.INTEGER, allowNull: false
  },
  branchCode: {
    type: DataTypes.STRING(4), allowNull: false
  },
  branchName: {
    type: DataTypes.STRING(100), allowNull: false
  },
  lineItemNumber: {
    type: DataTypes.INTEGER, allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER, allowNull: false
  },
  numberOfDriver: {
    type: DataTypes.INTEGER, allowNull: false
  },
  helperIncluded: {
    type: DataTypes.STRING(10), allowNull: false
  },
  reportIncluded: {
    type: DataTypes.STRING(10), allowNull: false
  },
  UJPIncluded: {
    type: DataTypes.STRING(10), allowNull: false
  },
  fuel: {
    type: DataTypes.STRING(10), allowNull: false
  },
  channelType: {
    type: DataTypes.STRING(10), allowNull: false
  },
  tollAndParking: {
    type: DataTypes.STRING(10), allowNull: false
  },
  driverOrRider: {
    type: DataTypes.STRING(10), allowNull: false
  },
  crew: {
    type: DataTypes.STRING(10), allowNull: false
  },
  coverageArea: {
    type: DataTypes.STRING(10), allowNull: false
  },
  startDate: {
    type: DataTypes.DATE, allowNull: false
  },
  endDate: {
    type: DataTypes.DATE, allowNull: false
  },
  isDedicated: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  isWithDriver: {
    type: DataTypes.BOOLEAN, allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN, allowNull: false
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
  }
  // ,
  // transactionId: {
  //   type: DataTypes.STRING(255), allowNull: true
  // },
  // persistedDate: {
  //   type: DataTypes.DATE, allowNull: true
  // },
  // dataStoreTime: {
  //   type: DataTypes.DATE, allowNull: true
  // },
  // sapMssqlSinkTime: {
  //   type: DataTypes.DATE, allowNull: true
  // },
},
  {
    tableName,
    timestamps: false
  }
);
