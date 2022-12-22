import { sequelize } from "./database";
import { applicationInsightsService } from "astrafms-services-error-logging";
import { AnswerLib } from "../models/answer.lib.model";
import { QuestionCategory } from "../models/question.category.model";
import { QuestionLib } from "../models/question.lib.model";
import * as stackTrace from "stack-trace";
import { FatigueInterview } from "../models/fatigue.interview.model";

class Sequelizer {
  private trace: any;
  private traceFileName: any;

  constructor() {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
  }

  public async sync() {
    try {
      if (Object.keys(QuestionCategory.associations).length === 0 && Object.keys(QuestionLib.associations).length === 0 && Object.keys(AnswerLib.associations).length === 0 && Object.keys(FatigueInterview.associations).length === 0) {
        // Associate Tables and create Foreign key
        QuestionCategory.hasMany(QuestionLib, {
          foreignKey: "questionCategoryId",
          sourceKey: "questionCategoryId",
        });
        QuestionLib.hasMany(AnswerLib, {
          foreignKey: "questionLibId",
          sourceKey: "questionLibId",
          as: "answerLibs",
        });
        QuestionLib.belongsTo(QuestionCategory, {
          foreignKey: "questionCategoryId",
          targetKey: "questionCategoryId",
          as: "questionCategory",
        });
      }
      // Create the table
      const db = await sequelize.sync();
      console.log("Sequelize READY");
    } catch (error) {
      console.log("@@ error Sequelize sync => ", error);
      throw applicationInsightsService.errorModel(
        error,
        "sequelizeSync",
        this.traceFileName
      );
    }
  }
}

export const sequelizer = new Sequelizer();
