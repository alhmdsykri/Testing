import { DataTypes, Optional, ModelDefined } from "sequelize";
import { RoleApprovalAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
    return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type RoleAppprovalCreationAttributes = Optional<RoleApprovalAttributes, "modifiedBy" | "modifiedAt">;
const tableName: string = "RoleApproval";
export const RoleAppprovalModelName: string = tableName;
export const RoleApproval: ModelDefined<RoleApprovalAttributes, RoleAppprovalCreationAttributes> = sequelize.define(tableName,
    {
        roleApprovalId: {
            type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true,
        },
        roleId: {
            type: DataTypes.STRING, allowNull: false
        },
        approvalId: {
            type: DataTypes.INTEGER, allowNull: false
        },
        approvalLevel: {
            type: DataTypes.INTEGER, allowNull: false
        },
        isSegatedDuty: {
            type: DataTypes.BOOLEAN, allowNull: false
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
