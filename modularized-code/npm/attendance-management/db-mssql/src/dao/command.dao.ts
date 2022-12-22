import * as stackTrace from "stack-trace";
import { CommonRequest, CommonResponseListDto, ResponseDataDto, CommonResponseDto, RECORD_STATUS, } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger, } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../private/database.credential";
import { sequelizer } from "../private/initialize.database";
import { helper } from "../utils/helper";
import { STATUS_CODE, FATIGUE_QUESTION } from "../constants/CONSTANTS.json";
import Sequelize from "sequelize";

const Op = Sequelize.Op;
import { sequelize } from "../private/database";
import { FatigueInterview } from "../models/fatigue.interview.model";
export class CommandDao {
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

  public async submitFatigueQuestion(commonRequest: CommonRequest) {
    this.logger.info("[DAO] submitFatigueQuestion 1 ...start");
    const body = commonRequest.body;
    try {
      const Fatigue: any = await FatigueInterview.create(body);
      const result = Fatigue.get({ plain: true });
      return result;
    } catch (error) {
      console.log("submitFatigueQuestion...err-->", error);
      throw applicationInsightsService.errorModel(
        error,
        "submitFatigueQuestion",
        this.traceFileName
      );
    }
  }
}
