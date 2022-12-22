import { NextFunction, Request, Response } from "express";
import * as stackTrace from "stack-trace";
import { Middleware } from "./model/middleware.model";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { DEFAULT } from "../constants/ERROR_MESSAGES.json";
import { MiddlewareService } from "astrafms-service-middleware";
import { CommonRequest } from "astrafms-common-dto-interface";
import KeyVaultSecrets from "./helper/keyvault.secrets"
import * as _ from "lodash";
import jwtDecode from "jwt-decode";

export class ValidateRBACMiddleWare {
  private trace: any;
  private traceFileName: any;

  private environment: any = null;

  constructor(env?: string) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.environment = env;
  }

  public async validateMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      if (this.environment === "production" || this.environment === "development") {
        const commonRequest: CommonRequest = new CommonRequest();
        const uid: number | null = Number(req.headers.userid) ? Number(req.headers.userid) : null;
        const fullUrl: string = req.protocol + "://" + req.get("host") + req.originalUrl;
        let userId: any = {};

        req.headers.transactionId = req.headers.transactionid ? req.headers.transactionid : "";
        req.headers.userId = req.headers.userId ? req.headers.userId : "";
        req.headers.fullUrl = fullUrl;

        if (!req.headers.authorization && !req.headers.userid) {
          throw new ErrorModel(STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED, `${DEFAULT.UNAUTHORIZED_USER}`, String(req.headers.transactionId));
        }

        if (req.headers.authorization) {
          let jwtData: any = {};

          try {
            jwtData = jwtDecode(req.headers.authorization);
            if (uid) {
              // userId as a number required for sql query
              commonRequest.headers = {
                transactionId: req.headers.transactionid,
                userId: Number(req.headers.userid),
                rbacBaseURL: process.env.BASE_URL_PRIVATE_RBAC_PERMISSION || null,
              }
              userId = req.headers.userid;
            } else {
              // TEMP - START
              console.log("-=-= via jwt  preferred_username token -=-=")
              const userName = jwtData.preferred_username;
              commonRequest.headers = {
                transactionId: req.headers.transactionid
              }
              commonRequest.body = {
                userName
              }
            }
          } catch (error) {
            const err: any = error;
            console.log("MSG RBAC Error -> ", err.message);
          }
        }
        else {
          commonRequest.headers = {
            transactionId: req.headers.transactionid,
            userId: Number(req.headers.userid),
            rbacBaseURL: process.env.BASE_URL_PRIVATE_RBAC_PERMISSION || null,
          }
          userId = req.headers.userid;
        }

        // Append Headers
        req.headers.userId = userId;
      }

      // !important
      return next();
    } catch (error) {
      console.log("Middleware Error: ", error)
      return this.logError(req, res, error);
    }
  }

  private logError(req: Request, res: Response, error: any) {
    console.log("Middleware : ERROR : ", error);
    const errMsg = `Error Encountered during validateMiddleware
    (${this.traceFileName}) ${error.appInsightRaw || error.message || error.description} `;
    if (!(error instanceof ErrorModel)) {
      error = applicationInsightsService.errorModel(error, "validateMiddleware", this.traceFileName);
    }
    const payload: any = applicationInsightsService.logError(req, error);
    res.status(payload.code).send(payload.result);
  }
}