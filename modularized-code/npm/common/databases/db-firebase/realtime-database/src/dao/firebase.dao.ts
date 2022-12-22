import { config } from "dotenv";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import * as admin from 'firebase-admin'
import { getDatabase, ref, set } from "firebase/database";
import { FirebaseDto } from "../dto/user.payload.dto"

export class FirebaseDao {
  private logger: any = Logger.getLogger("./db-firebase/realtime-database/firebase.dao")
  private trace: any;
  private traceFileName: any;

  constructor(serviceAccountKey: any, databaseUrl: string) {
    config();
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    if (serviceAccountKey) {
      this.firebaseConnection(serviceAccountKey, databaseUrl);
    }
  }

  public async firebaseConnection(serviceAccountKey: any, databaseUrl: string) {
    try {
      await (new Promise(async (resolve, reject) => {
        try {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountKey),
            databaseURL: databaseUrl
          });
          resolve(true);
        } catch (error) {
          reject(error)
        }
      }));
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "firebaseConnection", this.traceFileName);
    }
  }

  public async writeUserNotification(commonRequest: CommonRequest) {
    this.logger.info(`writeUserNotification DAO start..`);
    console.log("@@dao body", commonRequest);
    const userId: any = commonRequest.headers.userId;
    const db = admin.database();
    const dbref = db.ref(String(userId));
    try {
      const result = dbref.push({
        transactionId: commonRequest.body.transactionId,
        status: commonRequest.body.status,
        payload: commonRequest.body.payload,
        createdAt: new Date().toISOString(),
        entity: commonRequest.body.entity
      });
      return result
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "writeUserNotification", this.traceFileName);
    }
  }
}





