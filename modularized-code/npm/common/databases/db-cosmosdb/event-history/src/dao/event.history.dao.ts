import { config } from "dotenv";
import * as stackTrace from "stack-trace";
import { EventHistorModelName, EventHistorySchema } from "../schema/event.history.schema";
import { applicationInsightsService, Logger, MongoDBErrorType } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";


import mongoose, { ConnectOptions } from "mongoose";


export class EventHistoryDao {
  private logger: any = Logger.getLogger("./dao/cosmos/driver.dao")
  private trace: any;
  private traceFileName: any;
  private isLiveEnv: any;
  private eventHistorModel: any;

  constructor(connectionString: any,
    dbName: any, mongooseServerTimeOutMS: number = 5000,
    isLiveEnv: boolean = true) {
    config();
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.isLiveEnv = isLiveEnv;
    if (connectionString) {
      this.mongooseConnection(connectionString, dbName, mongooseServerTimeOutMS);
    }
  }

  public async mongooseConnection(connectionString: string, dbName: any, mongooseServerTimeOutMS: number = 5000) {
    try {
      if (this.isLiveEnv) {
        await (new Promise(async (resolve, reject) => {
          try {
            const options: ConnectOptions = {
              serverSelectionTimeoutMS: mongooseServerTimeOutMS,
              dbName
            }
            const conn = mongoose.createConnection(connectionString, options);
            this.eventHistorModel = conn.model(EventHistorModelName, EventHistorySchema);

            resolve(true);
          } catch (error) {
            reject(error)
          }
        }));
      }
    } catch (error) {
      console.log("@@ mongooseConnection -->> ", error)
      const err: any = error;
      err.appInsightRaw = JSON.parse(JSON.stringify(error)) as MongoDBErrorType;
      throw applicationInsightsService.errorModel(err, "mongooseConnection", this.traceFileName);
    }
  }

  public async createEvent(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createEvent...start");
    console.log(commonRequest);
    const body = {
      _id: commonRequest.body._id,
      source: commonRequest.body.source,
      method: commonRequest.body.method.toUpperCase(),
      payload: commonRequest.body.payload,
      // payload: {
      //   name: commonRequest.body.name,
      //   permissions: commonRequest.body.permissions,
      // },
      userId: commonRequest.headers.userId,
      status: commonRequest.body.status,
      transactionId: commonRequest.headers.transactionId,
      entity: commonRequest.body.entity
    }
    try {
      const driver = await this.eventHistorModel.create(body);
      return await driver.save();
    } catch (error) {
      const err: any = error;
      err.appInsightRaw = JSON.parse(JSON.stringify(error)) as MongoDBErrorType;
      throw applicationInsightsService.errorModel(err, "createEvent", this.traceFileName);
    }
  }
  public async getEventByTransactionId(transactionId: string) {
    this.logger.info("[DAO] getEventByTransactionId...start");
    console.log(transactionId);
    try {
      const result = await this.eventHistorModel.find({transactionId})
      console.log("dao result==>",result)
      console.log("dao result length==>",result.length)
      return await result
    } catch (error) {
      const err: any = error;
      err.appInsightRaw = JSON.parse(JSON.stringify(error)) as MongoDBErrorType;
      throw applicationInsightsService.errorModel(err, "getEventByTransactionId", this.traceFileName);
    }
  }

}

