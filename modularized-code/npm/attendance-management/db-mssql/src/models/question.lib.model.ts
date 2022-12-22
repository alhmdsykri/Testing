import { DataTypes, Optional, ModelDefined } from "sequelize";
import { QuestionLibAttribute } from "./interfaces";
import { sequelize } from "../private/database";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type QuestionLibAttributes = QuestionLibAttribute;
const tableName: string = "QuestionLib";
export const ModelName: string = tableName;
export const QuestionLib: ModelDefined<
  QuestionLibAttribute,
  QuestionLibAttributes
> = sequelize.define(
  tableName,
  {
    questionLibId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    questionCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "QuestionCategory",
        key: "questionCategoryId",
      },
    },
    questionText: {
      type: DataTypes.STRING(225),
      allowNull: false,
    },
    questionImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isHasImage: {
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
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "QuestionLib",
    schema: "dbo",
    timestamps: false,
    indexes: [
      {
        name: "PK_questionLibId",
        unique: true,
        fields: [{ name: "questionLibId" }],
      },
    ],
  }
);
