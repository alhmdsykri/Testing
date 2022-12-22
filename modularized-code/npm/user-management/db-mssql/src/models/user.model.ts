import { DataTypes, Optional, ModelDefined } from "sequelize";
import { UserAttributes } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type UserCreationAttributes = Optional<
  UserAttributes,
  "modifiedBy" | "modifiedAt"
>;
const tableName: string = "User";
export const UserModelName: string = tableName;
export const User: ModelDefined<UserAttributes, UserCreationAttributes> =
  sequelize.define(
    tableName,
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      oid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      personalId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      authenticationType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      password: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      failedLoginAttempt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      isSuspended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      modifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      uniqueKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      personalDataId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
    },
    {
      tableName,
      timestamps: false,
    }
  );
