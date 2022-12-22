import { NextFunction, Request, Response } from "express";
import * as stackTrace from "stack-trace";
import { Middleware } from "./model/middleware.model";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { DEFAULT } from "../constants/ERROR_MESSAGES.json";
import { CommonRequest, CommonResponseDto, DataRBACType } from "astrafms-common-dto-interface";
import { UserService } from "astrafms-service-user-management";
import KeyVaultSecrets from "./helper/keyvault.secrets"
import * as _ from "lodash";

export class ValidateAPIAccess {
  private trace: any;
  private traceFileName: any;
  private userService: UserService;
  private sqlCredentials: any = null;
  private redisCredentials: any = null;
  private environment: any = null;

  constructor(env?: string) {
    this.userService = new UserService(null, null, null, null, null, null);
    if (env === "production" || env === "development") {
      this.initSQLRedisConnections();
      this.environment = env;
    }
  }

  public async getDataRbac(userId: number) {
    const commonRequest: CommonRequest = new CommonRequest();
    commonRequest.headers = {
      userId,
      rbacBaseURL: process.env.BASE_URL_PRIVATE_RBAC_PERMISSION || null,
    }

    // Get user data rbac
    let mdDRbacResult: DataRBACType = {
      companies: [],
      businessUnits: [],
      branches: [],
      locations: []
    };
    try {
      mdDRbacResult = await this.userService.getDataRbac(commonRequest);
    } catch (drError) {
      throw applicationInsightsService.errorModel(drError, "getDataRbac", this.traceFileName);
    }
    return mdDRbacResult;
  }

  public async getAccessPermissions(featureAttributeId: string, commonRequest: CommonRequest) {
    try {
      await this.initSQLRedisConnections();
      const transactionId: any = commonRequest.headers?.transactionId;
      console.log(`RBAC Validating...: userId: ${commonRequest.headers?.userId} | userRoles: ${commonRequest.headers?.userRoles} `)

      const reponse: any = await this.userService.getAPIAccessPermissions(commonRequest, featureAttributeId);
      if (!reponse) {
        console.log(`RBAC Unauthorized: userId: ${commonRequest.headers?.userId} | userRoles: ${commonRequest.headers?.userRoles} `)
        throw new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, DEFAULT.UNAUTHORIZED_USER, transactionId);
      }

      if (reponse.data && reponse.data.length >= 1) {
        const active: any = reponse.data[0]?.active;
        if (active === 0) {
          console.log(`RBAC Unauthorized: userId: ${commonRequest.headers?.userId} | userRoles: ${commonRequest.headers?.userRoles} `)
          throw new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, DEFAULT.UNAUTHORIZED_USER, transactionId);
        }
        console.log(`${featureAttributeId} - Authorized!`)
      } else {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, DEFAULT.UNAUTHORIZED_USER, transactionId);
      }


    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAccessPermissions", this.traceFileName);
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
}

// export const validateAPIAccess = new ValidateAPIAccess();

