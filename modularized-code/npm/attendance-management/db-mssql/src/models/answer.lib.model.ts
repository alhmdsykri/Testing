import { DataTypes, Optional, ModelDefined } from "sequelize";
import { sequelize } from "../private/database";
import { AnswerLibAttribute } from "./interfaces/answer.lib.model.interface";
DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

type AnswerLibAttributes = AnswerLibAttribute;
const tableName: string = "AnswerLib";
export const ModelName: string = tableName;
export const AnswerLib: ModelDefined<AnswerLibAttribute, AnswerLibAttributes> =
  sequelize.define(
    tableName,
    {
      answerLibId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      questionLibId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "QuestionLib",
          key: "questionLibId",
        },
      },
      answerText: {
        type: DataTypes.STRING(225),
        allowNull: false,
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
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
      tableName: "AnswerLib",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK_answerLibId",
          unique: true,
          fields: [{ name: "answerLibId" }],
        },
      ],
    }
  );
