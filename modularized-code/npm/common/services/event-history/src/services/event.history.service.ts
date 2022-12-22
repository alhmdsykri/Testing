import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { SUCCESS } from "../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import { helper } from "../utils/helper";

import { EventHistoryDao } from "astrafms-db-cosmos-event-history";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto } from "astrafms-common-dto-interface";
import {CheckStatusResponseItemsDto} from "astrafms-common-dto-interface";
export class EventHistoryService {
  private logger: any = Logger.getLogger("./services/eventr.history.services")
  private trace: any;
  private traceFileName: any;
  private eventHistoryDao: any;

  constructor(connectionString: any, dbName: any, mongooseServerTimeOutMS: number = 5000) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    if (connectionString) {
      this.eventHistoryDao = new EventHistoryDao(connectionString, dbName, mongooseServerTimeOutMS);
    }
  }

  public async createEvent(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[SERVICE] createEvent start....xx.`);
      console.log(commonRequest);
      const id: any = helper.makeidTimestamp();
      commonRequest.body._id = id;

      await this.eventHistoryDao.createEvent(commonRequest);

      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest?.headers?.transactionId);
      response.message = SUCCESS.CREATE_EVENTS;
      return response;
    } catch (error) {
      this.logger.error(`createEvent error ${error}`);
      throw applicationInsightsService.errorModel(error, "createEvent", this.traceFileName);
    }
  }
  public async getEventByTransactionId(transactionId :string) {
    this.logger.info("[getEventByTransactionId]...start");
    try {
      const result: any = await this.eventHistoryDao.getEventByTransactionId(transactionId);
      console.log("result service ====>",result)

      console.log("result.length====>",result.length)
      const response: CheckStatusResponseItemsDto<any> = new CheckStatusResponseItemsDto();
      if (result.length <1){
        response.code = STATUS_CODE.CLIENT_ERROR.NOT_FOUND;
        response.transactionId = transactionId;
        response.data = result,
        response.status = false,
        response.message ="Trace Data Not Found";
        return  response
      }
      const resultdata : any = result[result.length -1]
      console.log("resultdata getEventByTransactionId service ====>",resultdata)
      if (resultdata.status ===2){
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.status = true;
        response.data = resultdata
        response.message ="success";
        return response;
      } else {
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.data = resultdata
        response.status = false;
        response.message ="success";
        return response;
      }
    } catch (error) {
      this.logger.error(`getEventByTransactionId error ${error}`);
      throw applicationInsightsService.errorModel(error, "getEventByTransactionId", this.traceFileName);
    }
  }
}

