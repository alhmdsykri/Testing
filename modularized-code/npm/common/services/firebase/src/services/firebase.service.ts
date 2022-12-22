import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { SUCCESS } from "../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";

import { FirebaseDao } from "astrafms-db-firebase-realtime-database";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto } from "astrafms-common-dto-interface";

export class FirebaseService {
  private logger: any = Logger.getLogger("./services/eventr.history.services")
  private trace: any;
  private traceFileName: any;
  private firebaseDao: any;

  constructor(serviceAccoutnKey: any, databaseUrl: string) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    if (serviceAccoutnKey && databaseUrl) {
      this.firebaseDao = new FirebaseDao(serviceAccoutnKey, databaseUrl);
    }
  }

  public async writeUserNotification(commonRequest: CommonRequest) {
    try {
      this.logger.info(`writeUserNotificatione start..`);

      await this.firebaseDao.writeUserNotification(commonRequest);

      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest?.headers?.transactionId);
      response.message = SUCCESS.CREATE;
      return response;
    } catch (error) {
      this.logger.error(`writeUserNotification error ${error}`);
      throw applicationInsightsService.errorModel(error, "writeUserNotification", this.traceFileName);
    }
  }
}

