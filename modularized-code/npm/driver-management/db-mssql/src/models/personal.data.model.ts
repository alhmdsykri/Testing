import { DataTypes, Optional, ModelDefined } from "sequelize";
import { PersonalDataAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type PersonalDataAttributes = Optional<PersonalDataAttribute, "modifiedBy" | "modifiedAt">;
const tableName: string = "PersonalData";
export const ModelName: string = tableName;
export const PersonalData: ModelDefined<PersonalDataAttribute, PersonalDataAttributes> = sequelize.define(tableName, {
  personalDataId: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  personalCode: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  nrp: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  birthPlace: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  handphone: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  customerPosition: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  assignmentCompanyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignmentCompanyCode: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  assignmentCompanyName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  assignmentBranchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignmentBranchCode: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  assignmentBranchName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  placementBusinessUnitId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  placementBusinessUnitCode: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  placementBusinessUnitName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  placementBranchId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  placementBranchCode: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  placementBranchName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  placementLocationId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  placementLocationCode: {
    type: DataTypes.STRING(8),
    allowNull: true
  },
  placementLocationName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  coordinatorUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  coordinatorUserCode: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  coordinatorUserName: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  coordinatorUserRoleName: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  customerContractNumber: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customerCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  photoFront: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  photoLeft: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  photoRight: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bankId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Bank',
      key: 'bankId'
    }
  },
  bankAccountNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bankAccountName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  maritalStatusId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'MaritalStatus',
      key: 'maritalStatusId'
    }
  },
  maritalDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  religionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Religion',
      key: 'religionId'
    }
  },
  nationalityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Nationality',
      key: 'nationalityId'
    }
  },
  costCenterCode: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  costCenterName: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  uniformSize: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  shoesSize: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  pantsSize: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true
  },
  bloodType: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  currentLocationLong: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  currentLocationLat: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  currentLocationUpdateTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isDriver: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  genderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Gender',
      key: 'genderId'
    }
  },
  SAPSyncDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  employeeStatusId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'EmployeeStatus',
      key: 'employeeStatusId'
    }
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
  transactionId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
}, {
  tableName: 'PersonalData',
  schema: 'dbo',
  timestamps: false,
  indexes: [
    {
      name: "PK_PersonalData",
      unique: true,
      fields: [
        { name: "personalDataId" },
      ]
    },
  ]
});
