import { DataTypes, Optional, ModelDefined   } from "sequelize";
import { UserOTPAttributes  } from "./interface/index";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type UserOTPCreationAttributes = Optional<UserOTPAttributes, "modifiedAt">;
const tableName: string = "UserOTP";
export const UserOTPModelName: string = tableName;
export const UserOTP: ModelDefined<UserOTPAttributes, UserOTPCreationAttributes> = sequelize.define(tableName, {
    userOTPId: {
      type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true
    },
    userId: {
      type: DataTypes.STRING, allowNull: false
    },
    otp: {
      type: DataTypes.STRING, allowNull: false
    },
    isActive: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE, allowNull: false
    }
  },
  {
    tableName,
    timestamps: false
  }
);
