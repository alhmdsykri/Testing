import { DataTypes, Optional, ModelDefined } from "sequelize";
import { QuestionCategoryAttribute } from "./interfaces/index";
import { sequelize } from "../private/database";

type QuestionCategoryAttributes = QuestionCategoryAttribute;
const tableName: string = "QuestionCategory";
export const ModelName: string = tableName;
export const QuestionCategory: ModelDefined<
  QuestionCategoryAttribute,
  QuestionCategoryAttributes
> = sequelize.define(
  tableName,
  {
    questionCategoryId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    questionCategoryDesc: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "QuestionCategory",
    schema: "dbo",
    timestamps: false,
    indexes: [
      {
        name: "questionCategoryId",
        unique: true,
        fields: [{ name: "questionCategoryId" }],
      },
    ],
  }
);
