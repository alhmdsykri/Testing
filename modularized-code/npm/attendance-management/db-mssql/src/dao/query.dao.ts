import * as stackTrace from "stack-trace";
import {
  CommonRequest,
  CommonResponseListDto,
  ResponseDataDto,
  CommonResponseDto,
  RECORD_STATUS,
} from "astrafms-common-dto-interface";
import {
  applicationInsightsService,
  Logger,
} from "astrafms-services-error-logging";
import { DatabaseCredential } from "../private/database.credential";
import { sequelizer } from "../private/initialize.database";
import { helper } from "../utils/helper";
import { STATUS_CODE, FATIGUE_QUESTION } from "../constants/CONSTANTS.json";
import Sequelize from "sequelize";
import moment from 'moment';

const Op = Sequelize.Op;
import { sequelize } from "../private/database";
import { AnswerLib } from "../models/answer.lib.model";
import { QuestionLib } from "../models/question.lib.model";
import { QuestionCategory } from "../models/question.category.model";
import { QuestionFatiogueDto } from "../dto/QuestionFatigue";
import { QuestionCategoryAttribute } from "../models/interfaces/question.category.model.interface";
import { FatigueInterview } from "../models/fatigue.interview.model";
const { QueryTypes } = require('sequelize');

export class QueryDao {
  private logger: any = Logger.getLogger("./dao/mssql/attendance.dao");
  private trace: any;
  private traceFileName: any;

  constructor(
    host: string | null,
    username: string | null,
    password: string | null,
    databaseName: string | null
  ) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    DatabaseCredential.set(host, username, password, databaseName);
    if (host) {
      sequelizer.sync();
    }
  }

  // -=-=-=-=-=---=- QUESTION FATIGUE -=-=-=-=-=-=-- //

  public async getRandomQuestionAnswers(commonRequest: CommonRequest) {
    this.logger.info("dao getRandomQuestionAnswers...start");
    try {
      const query: any = commonRequest.query;
      const numberOfSelfCondition: number = Number(query.numberOfSelfCondition);
      const numberOfKnowledge: number = Number(query.numberOfKnowledge);
      const numberOfDeclaration: number = Number(query.numberOfDeclaration);

      const resQuerySelfCondition: any = (await QuestionCategory.findAll({
        logging: console.log,
        subQuery: false,
        attributes: [],
        include: [
          {
            model: QuestionLib,
            attributes: ["questionLibId"],
            required: false,
            paranoid: false,
            where: { status: RECORD_STATUS.COMPLETED },
          },
        ],
        where: { questionCategoryId: FATIGUE_QUESTION.SELF_CONDITION_ID },

        limit: numberOfSelfCondition,
        order: [Sequelize.fn("NEWID")],
        raw: true,
        nest: true,
      })) as QuestionFatiogueDto[];
      const questionLibIds: any[] = [];
      for (const q of resQuerySelfCondition) {
        questionLibIds.push(q.QuestionLibs.questionLibId);
      }
      const resQuerKnowledge: any = (await QuestionCategory.findAll({
        logging: console.log,
        subQuery: false,
        attributes: [],
        include: [
          {
            model: QuestionLib,
            attributes: ["questionLibId"],
            required: false,
            paranoid: false,
            where: { status: RECORD_STATUS.COMPLETED },
          },
        ],
        where: { questionCategoryId: FATIGUE_QUESTION.KNOWLEDGE_ID },

        limit: numberOfKnowledge,
        order: [Sequelize.fn("NEWID")],
        raw: true,
        nest: true,
      })) as QuestionFatiogueDto[];
      for (const q of resQuerKnowledge) {
        questionLibIds.push(q.QuestionLibs.questionLibId);
      }
      const resQueryDeclaration: any = (await QuestionCategory.findAll({
        logging: console.log,
        subQuery: false,
        attributes: [],
        include: [
          {
            model: QuestionLib,
            attributes: ["questionLibId"],
            required: false,
            paranoid: false,
            where: { status: RECORD_STATUS.COMPLETED },
          },
        ],
        where: { questionCategoryId: FATIGUE_QUESTION.DECLARATION_ID },

        limit: numberOfDeclaration,
        order: [Sequelize.fn("NEWID")],
        raw: true,
        nest: true,
      })) as QuestionFatiogueDto[];
      for (const q of resQueryDeclaration) {
        questionLibIds.push(q.QuestionLibs.questionLibId);
      }
      return questionLibIds;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRandomQuestionAnswers",
        this.traceFileName
      );
    }
  }

  public async getFatigueResult(QuestionIds: any) {
    this.logger.info("dao getFatigueResult...start");
    try {
      const QuestionIdsString: string = QuestionIds.join(",");
      const resultQuery: any = (await QuestionLib.findAll({
        logging: console.log,
        subQuery: false,
        attributes: [
          "questionLibId",
          "questionText",
          "questionImage",
          "isHasImage",
        ],
        include: [
          {
            model: QuestionCategory,
            as: "questionCategory",
            attributes: ["questionCategoryId", "questionCategoryDesc"],
            required: false,
            paranoid: false,
          },
          {
            model: AnswerLib,
            as: "answerLibs",
            attributes: ["answerLibId", "answerText", "isCorrect", "score"],
            required: false,
            paranoid: false,
            where: { status: RECORD_STATUS.COMPLETED },
          },
        ],
        where: {
          questionLibId: {
            [Op.in]: QuestionIds,
          },
        },
        order: [sequelize.literal(`CHARINDEX(','+CAST([QuestionLib].[questionLibId] as varchar)+',',','+'${QuestionIdsString}'+',')`)],
        raw: false,
        nest: true,
      })) as QuestionFatiogueDto[];
      return resultQuery;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getFatigueResult",
        this.traceFileName
      );
    }
  }

  public async getFatigueStatusHistory(commonRequest: CommonRequest) {
    this.logger.info("[DAO getFatigueStatusHistory]. . .start");
    try {
      const fatigueStatus: any = await FatigueInterview.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: [
          "isPassed",
          "createdAt",
          "modifiedAt",
          "interviewTimestamp",
        ],
        where: {
          interviewTimestamp: {
            [Op.gte]: moment().subtract(7, 'days').toDate()
          }
        }
      });

      console.log('=== hasil query ===', fatigueStatus);

      // const fatigueStatusHistory: any = {
      //   currentFatigue: fatigueStatus.isPassed,
      //   fatigueHistory: fatigueStatus
      // }

      // const response: ResponseDataDto = {};
      // response.transactionId = commonRequest.headers?.transactionId;
      // response.message = "Successfully get list of driver's fatigue status history";
      // response.data = fatigueStatusHistory;

      return fatigueStatus;
    } catch (error) {
      throw applicationInsightsService.errorModel(error,"getFatigueStatusHistory",this.traceFileName)
    }
  }

  public async submitTimeValidation(commonRequest: CommonRequest) {
    this.logger.info("[DAO submitTimeValidation]. . .start");
    try {
      const result: any = await sequelize.query(`
      SELECT interviewTime FROM ( SELECT CAST(dateadd(HOUR, 7, interviewTimestamp) as date)
      as interviewTime FROM FatigueInterview WHERE FatigueInterview.personalDataId = :personalDataIdParam)
      as B WHERE B .interviewTime = (SELECT CONVERT(varchar, getdate(), 23))UNION ALL SELECT interviewTimeParam
      FROM  (SELECT CAST(fi.interviewTimestamp as date) as interviewTimeParam FROM  dbo.FatigueInterview fi
      WHERE  fi.personalDataId = :personalDataIdParam )AS C WHERE  c.interviewTimeParam = :time`, {
        replacements: {
          personalDataIdParam: commonRequest.body.personalDataId,
          time: commonRequest.body.interviewTimestamp
        },
        type: QueryTypes.SELECT,
        logging: console.log
      })
      console.log("result", result)
      return result;

    } catch (error) {
      throw applicationInsightsService.errorModel(error, "submitTimeValidation", this.traceFileName);
    }
  }
  public async checkFatigueStatus(commonRequest: CommonRequest) {
    this.logger.info("[DAO checkFatigueStatus]. . .start");
    try {
      const result: any = await sequelize.query(`
      SELECT interviewTime FROM ( SELECT CAST(dateadd(HOUR, 7, interviewTimestamp) as date) `+ `
      as interviewTime FROM FatigueInterview WHERE FatigueInterview.personalDataId = :personalDataIdParam) `+ `
      as B WHERE B .interviewTime = (SELECT CONVERT(varchar, getdate(), 23))UNION ALL SELECT interviewTimeParam `+ `
      FROM  (SELECT CAST(fi.interviewTimestamp as date) as interviewTimeParam FROM  dbo.FatigueInterview fi `+ `
      WHERE  fi.personalDataId = :personalDataIdParam )AS C`, {
        replacements: {
          personalDataIdParam: commonRequest.body.personalDataId,
        },
        type: QueryTypes.SELECT,
        logging: console.log
      })
      console.log("result", result)
      return result;

    } catch (error) {
      throw applicationInsightsService.errorModel(error, "checkFatigueStatus", this.traceFileName);
    }
  }
}
