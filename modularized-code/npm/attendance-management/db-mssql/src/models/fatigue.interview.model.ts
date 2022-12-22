import { DataTypes, Optional, ModelDefined } from "sequelize";
import { FatigueInterviewAttribute } from "./interfaces";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type FatigueInterviewAttributes = FatigueInterviewAttribute;
const tableName: string = "FatigueInterview";
export const ModelName: string = tableName;
export const FatigueInterview: ModelDefined<
  FatigueInterviewAttribute,
  FatigueInterviewAttributes
> = sequelize.define(
  tableName,
  {
    fatigueInterviewId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    fatigueStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "FatigueStatus",
        key: "fatigueStatusId",
      },
    },
    personalDataId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interviewTimestamp: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    totalScore: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    minScore: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    isPassed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "FatigueInterview",
    schema: "dbo",
    timestamps: false,
    indexes: [
      {
        name: "PK_FatigueInterview",
        unique: true,
        fields: [{ name: "fatigueInterviewId" }],
      },
    ],
  }
);
