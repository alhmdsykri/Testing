import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalContractAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalContractAttributes = Optional<PersonalContractAttribute, "modifiedBy" | "modifiedAt">;
const tableName: string = "PersonalContract";
export const ModelName: string = tableName;
export const PersonalContract: ModelDefined<PersonalContractAttribute, PersonalContractAttributes> = sequelize.define(tableName, {
  personalContractId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  personalDataId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PersonalData',
      key: 'personalDataId'
    }
  },
  contractStart: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  contractEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  terminationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  contractStatus: {
    type: DataTypes.INTEGER,
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
  createdAt: {
    type: DataTypes.DATE,
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
  },
  contractTypeCode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    references: {
      model: 'contractTypeCode',
      key: 'ContractType'
    }
  }
}, {
  tableName: 'PersonalContract',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalContract",
      unique: true,
      fields: [
        { name: "personalContractId" },
      ]
    },
  ]
});
