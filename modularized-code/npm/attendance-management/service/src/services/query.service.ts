import {
  STATUS_CODE,
  REDIS_CACHE,
  PBAC,
  EXTERNAL_API,
} from "../constants/CONSTANTS.json";
import { ERROR, SUCCESS } from "../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import {
  applicationInsightsService,
  Logger,
  ErrorModel,
} from "astrafms-services-error-logging";
import {
  CommonRequest,
  CommonResponseDto,
  ResponseDataDto,
  CommonResponseListDto,
} from "astrafms-common-dto-interface";
import { QueryDao, sequelize } from "astrafms-db-mssql-attendance-management";
import { ExternalService } from "../external/externalService";

import * as _ from "lodash";
import { isArray } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { CpuInfo } from "os";

export class QueryService {
  private logger: any = Logger.getLogger("./services/query.service");
  private trace: any;
  private traceFileName: any;
  private queryDao: QueryDao;
  private externalService: ExternalService;

  constructor(
    host: string | null,
    username: string | null,
    password: string | null,
    databaseName: string | null,
    redisHost: string | null,
    redisKey: string | null
  ) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.queryDao = new QueryDao(null, null, null, null);
    this.externalService = new ExternalService()
    if (host) {
      sequelize.sync();
      this.queryDao = new QueryDao(host, username, password, databaseName);
      const externalService: ExternalService = new ExternalService();

    }
  }


  public async getAllQuestionAnswer(commonRequest: CommonRequest) {
    this.logger.info("[getAllQuestionAnswer]...start");
    try {
      const questionIds: any = await this.queryDao.getRandomQuestionAnswers(
        commonRequest
      );
      const result: any = await this.queryDao.getFatigueResult(questionIds);
      return result;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "getAllQuestionAnswer",
        this.traceFileName
      );
    }
  }

  public async getExternalPersonalIdValidation(commonRequest: CommonRequest) {
    this.logger.info("[]QueryService.[getExternalPersonalIdValidation]...start");
    try {
      const result: any = await this.externalService.getExternalPersonalIdValidation(commonRequest);
      return result;
    } catch (error) {
      console.log("@@ error  -->> ", error);
      return applicationInsightsService.errorModel(
        error,
        "getExternalPersonalIdValidation",
        this.traceFileName
      );
    }
  }

  public async getAllFatigueStatus(commonRequest: CommonRequest) {
    this.logger.info("getAllFatigueStatus. . .start");
    try {
      let  commonRequestValidation:CommonRequest ={}
      commonRequestValidation.body = {
        personalDataId : commonRequest.params.personalDataId
      }

      console.log("MENMEN", commonRequestValidation)

      let isValid :boolean = false
      const submitTimeValidationResult: any = await this.queryDao.checkFatigueStatus(commonRequestValidation);
      if (submitTimeValidationResult.length <= 0) {
        isValid = true
      }else{
        isValid = false

      }
      const result: any = await this.queryDao.getFatigueStatusHistory(commonRequest);
      const AllResult = {
            "currentFatigue": isValid,
            "fatigueHistory":result
      }    
      return AllResult;
    } catch (error) {
      throw applicationInsightsService.errorModel(error,"getAllFatigueStatus",this.traceFileName);
    }
  }

  public async submitTimeValidation(commonRequest: CommonRequest) {
    this.logger.info("[submitTimeValidation]...start");
    try {
      const result: any = await this.queryDao.submitTimeValidation(commonRequest);

      return result;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "submitTimeValidation",
        this.traceFileName
      );
    }
  }
}
