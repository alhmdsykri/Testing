import { DataTypes, Optional, ModelDefined } from "sequelize";
import { ApprovalAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
  };

type ApprovalCreationAttributes = Optional<ApprovalAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "ApprovalTopic";
export const ApprovalModelName: string = tableName;
export const ApprovalTopic: ModelDefined<ApprovalAttributes, ApprovalCreationAttributes> = sequelize.define(tableName, {
    approvalTopicId: {
        type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true
    },
    description: {
        type: DataTypes.STRING, allowNull: false
    },
    validate: {
        type: DataTypes.INTEGER, allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER, allowNull: false
    },
    productCode: {
        type: DataTypes.STRING, allowNull: true
    },
    productName: {
        type: DataTypes.STRING, allowNull: true
    },
    businessUnitId: {
        type: DataTypes.INTEGER, allowNull: true, unique: true
    },
    businessUnitCode: {
        type: DataTypes.STRING, allowNull: true
    },
    businessUnitName: {
        type: DataTypes.STRING, allowNull: true
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
        type: DataTypes.STRING, allowNull: false
    },
    version: {
        type: DataTypes.INTEGER, allowNull: true, defaultValue: 1
    }
},
    {
        tableName,
        timestamps: false
    }
);
