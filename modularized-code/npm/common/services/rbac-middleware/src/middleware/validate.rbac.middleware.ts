import { NextFunction, Request, Response } from "express";
import * as stackTrace from "stack-trace";
import { Middleware } from "./model/middleware.model";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { DEFAULT } from "../constants/ERROR_MESSAGES.json";
import { UserService } from "astrafms-service-user-management";
import { CommonRequest } from "astrafms-common-dto-interface";
import KeyVaultSecrets from "./helper/keyvault.secrets"
import * as _ from "lodash";
import jwtDecode from "jwt-decode";

export class ValidateRBACMiddleWare {
  private trace: any;
  private traceFileName: any;

  private userService: UserService;
  private sqlCredentials: any = null;
  private redisCredentials: any = null;
  private environment: any = null;

  constructor(env?: string) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.userService = new UserService(null, null, null, null, null, null);
    if (env === "production" || env === "development") {
      this.initSQLRedisConnections();
      this.environment = env;
    }
  }

  public async validateMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      if (this.environment === "production" || this.environment === "development") {
        const commonRequest: CommonRequest = new CommonRequest();
        const uid: number | null = Number(req.headers.userid) ? Number(req.headers.userid) : null;
        let userId: any = {};
        await this.initSQLRedisConnections();

        req.headers.transactionId = req.headers.transactionid ? req.headers.transactionid : "";
        req.headers.userId = req.headers.userId ? req.headers.userId : "";
        if (!req.headers.authorization && !req.headers.userid) {
          throw new ErrorModel(STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED, `${DEFAULT.UNAUTHORIZED_USER}`, String(req.headers.transactionId));
        }
        if (req.headers.authorization) {
          let jwtData: any = {};
          try {
            jwtData = jwtDecode(req.headers.authorization);
            if (uid) {
              console.log("-=-= via headers userId -=-=")
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
              // Get User Information
              const userInfo: any = await this.userService.getUserByEmailOrUserNameOrPersonalId(commonRequest);
              console.log("xRBAC userInfo -> ", userInfo);
              userId = userInfo?.data?.userId;
              commonRequest.headers.userId = userId;
              // Append Headers
              req.headers.userId = userId;
              // TEMP - END
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

        // Get User Role
        let userRoles: any[] = [];
        console.log("GET ROLES commonRequest --->> ", commonRequest)
        const userRolesData: any = await this.userService.getUserRoles(commonRequest);
        console.log("xRBAC userRoles -> ", userRolesData);
        if (userRolesData.userRoles && Array.isArray(userRolesData.userRoles) && userRolesData.userRoles.length >= 1) {
          userRoles = _.map(userRolesData.userRoles, "roleId");
        }

        // Append Headers
        req.headers.userId = userId;
        req.headers.userRoles = userRoles;

        console.log("@@ HEADERS -->> ", req.headers)
      }

      // !important
      return next();
    } catch (error) {
      console.log("Middleware Error: ", error)
      return this.logError(req, res, error);
    }
  }

  private async initSQLRedisConnections() {
    try {
      if (!this.sqlCredentials && !this.redisCredentials) {
        const [
          sqlCredentials,
          redisCredentials
        ] = await Promise.all(
          [
            await KeyVaultSecrets.getSQLCredentials(),
            await KeyVaultSecrets.getRedisCredentials()
          ]);
        this.sqlCredentials = sqlCredentials;
        this.redisCredentials = redisCredentials;
        this.userService = new UserService(
          this.sqlCredentials?.host, this.sqlCredentials?.username, this.sqlCredentials.password, this.sqlCredentials.db,
          this.redisCredentials?.redisHostName, this.redisCredentials?.redisKey
        );
      }
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "initSQLRedisConnections", this.traceFileName);
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