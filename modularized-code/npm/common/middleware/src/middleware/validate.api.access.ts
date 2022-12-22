import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { DEFAULT, RESOURCE } from "../constants/ERROR_MESSAGES.json";
import { CommonRequest, DataRBACType } from "astrafms-common-dto-interface";
import { MiddlewareService } from "astrafms-service-middleware";
import KeyVaultSecrets from "./helper/keyvault.secrets"
import * as _ from "lodash";

export class ValidateAPIAccess {
  private traceFileName: any;
  private middlewareService: MiddlewareService;
  private redisCredentials: any = null;

  constructor(env?: string) {
    this.middlewareService = new MiddlewareService(null, null);
    if (env === "production" || env === "development") {
      this.initRedisConnections();
    }
  }

  public async getDataRbac(userId: number) {
    const commonRequest: CommonRequest = new CommonRequest();
    commonRequest.headers = {
      userId,
      rbacBaseURL: process.env.BASE_URL_PRIVATE_RBAC_PERMISSION || null,
    }

    let mdDRbacResult: DataRBACType = {
      companies: [],
      businessUnits: [],
      branches: [],
      locations: []
    };
    try {
      mdDRbacResult = await this.middlewareService.getDataRbac(commonRequest);
    } catch (drError) {
      throw applicationInsightsService.errorModel(drError, "getDataRbac", this.traceFileName);
    }
    return mdDRbacResult;
  }

  public async getAccessPermissions(featureAttributeId: string, commonRequest: CommonRequest) {
    try {
      const userId: string = commonRequest.headers.userId;
      const transactionId: string = commonRequest.headers.transactionId;
      console.log("getAccessPermissions begin... userId : " + userId + " transactionId : " + transactionId)

      if (!userId || userId == "undefined" || Object.keys(userId).length === 0) {
        console.log("getAccessPermission user id   undefined condition")
        throw new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          RESOURCE.USERID,
          transactionId
        );
      }
      if (!transactionId) {
        console.log("getAccessPermission transactionId  undefined condition")

        throw new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          RESOURCE.TRANSACTIONID,
          transactionId
        );
      }

      await this.initRedisConnections();
      const response: any = await this.middlewareService.getAPIAccessPermissions(commonRequest, featureAttributeId);
      if (!response) {
        console.log(`RBAC Unauthorized: userId: ${commonRequest.headers?.userId} | userRoles: ${commonRequest.headers?.userRoles} `)
        throw new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, DEFAULT.UNAUTHORIZED_USER, transactionId);
      }
      if (response.data && response.data.length >= 1) {
        const active: any = response.data[0]?.active;
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

  private async initRedisConnections() {
    try {
      if (!this.redisCredentials) {
        const [
          redisCredentials
        ] = await Promise.all(
          [
            await KeyVaultSecrets.getRedisCredentials()
          ]);
        this.redisCredentials = redisCredentials;
        this.middlewareService = new MiddlewareService(
          this.redisCredentials?.redisHostName, this.redisCredentials?.redisKey
        );
      }
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "initRedisConnections", this.traceFileName);
    }
  }
}
