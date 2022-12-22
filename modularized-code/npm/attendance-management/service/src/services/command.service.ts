import {
  STATUS_CODE
} from "../constants/CONSTANTS.json";
import { ERROR, SUCCESS } from "../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import {
  applicationInsightsService,
  Logger,
} from "astrafms-services-error-logging";
import {
  CommonRequest,
  CommonResponseListDto,
} from "astrafms-common-dto-interface";
import { CommandDao, sequelize } from "astrafms-db-mssql-attendance-management";
import * as _ from "lodash";

export class CommandService {
  private logger: any = Logger.getLogger("./services/command.service");
  private trace: any;
  private traceFileName: any;
  private commandDao: CommandDao;

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
    this.commandDao = new CommandDao(null, null, null, null);
    if (host) {
      sequelize.sync();
      this.commandDao = new CommandDao(host, username, password, databaseName);
    }
  }

  public async submitFatigueQuestion(commonRequest: CommonRequest) {
    this.logger.info("[submitFatigueQuestion]...start");
    try {
      const result = await this.commandDao.submitFatigueQuestion(
        commonRequest
      );
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = commonRequest.headers.transactionId;
      response.message = SUCCESS.SUBMIT_FATIGUE_QUESTION;
      response.data = result


      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "submitFatigueQuestion",
        this.traceFileName
      );
    }
  }
}
