import { STATUS_CODE, REDIS_CACHE, PBAC, EXTERNAL_API } from "../constants/CONSTANTS.json";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto, ICreateRole, IPermissions, CommonResponseListDto } from "astrafms-common-dto-interface";
import { externalAPIService } from "astrafms-services-utilities";
import { Redis } from "../redis/redis";
import * as _ from "lodash";

export class MiddlewareService {
  private logger: any = Logger.getLogger("./services/middleware.service")
  private trace: any;
  private traceFileName: any;
  private redis: Redis;

  constructor(redisHost: string | null, redisKey: string | null) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.redis = new Redis(null, null);
    if (redisHost) {
      this.redis = new Redis(redisHost, redisKey)
    }
  }

  public async getDataRbac(commonRequest: CommonRequest) {
    this.logger.info(`getDataRbac...start `);
    try {
      // console.log("getAPIAccessPermissions --> ", commonRequest)
      let userDataRbac: any = {};
      const rbacBaseUrl: any = commonRequest.headers?.rbacBaseURL;
      const userId: any = (commonRequest.headers?.userId) ? commonRequest.headers?.userId : null;
      // Check Redis Cache
      const redisConn = await this.redis.getCacheConnection();
      const dRbacPattern: any = REDIS_CACHE.DRBAC.USER_HASH_KEY;
      const dataRbacs = await this.redis.hmget(redisConn, dRbacPattern, userId);
      if (dataRbacs && Array.isArray(dataRbacs) && dataRbacs.length >= 1) {
        userDataRbac = JSON.parse(dataRbacs[0]);
        if (!userDataRbac) {
          console.log("Call Private API - /api/user/v1/data-rbac/:userId")
          commonRequest.url = rbacBaseUrl + EXTERNAL_API.PR_DATA_RBAC.replace(":userId", userId);
          try {
            const reponse: any = await externalAPIService.get(commonRequest);
            if (reponse && reponse.data) {
              return reponse.data;
            } else {
              return null;
            }
          } catch (error) {
            const err: any = error;
            if (!err && err.code !== 404) {
              throw applicationInsightsService.errorModel(error, "getDataRbac", this.traceFileName);
            }
          }
        }
      } else {
        return null
      }
      return userDataRbac;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataRbac", this.traceFileName);
    }
  }

  public async getAPIAccessPermissions(commonRequest: CommonRequest, featureAttributeId: any) {
    this.logger.info(`getAPIAccessPermissions...start -> ${featureAttributeId}`);
    try {
      let data: any = {};
      const appId: any = commonRequest.headers?.appId;
      const rbacBaseUrl: any = commonRequest.headers?.rbacBaseURL;
      const userId: any = (commonRequest.headers?.userId) ? commonRequest.headers?.userId : null;
      // Check Redis Cache
      const redisConn = await this.redis.getCacheConnection();
      let rbacPattern: any = REDIS_CACHE.RBAC.USER_HASH_NAME;
      rbacPattern = rbacPattern.replace("userId", String(userId));
      const rbacLength: any = await this.redis.hlen(redisConn, rbacPattern);

      if (rbacLength >= 1) {
        console.log("Resource RBAC from REDIS Cache")
        const userRbacKeys: any = await this.redis.hkeys(redisConn, rbacPattern);
        const validated: any = _.includes(userRbacKeys, featureAttributeId);
        const permission = await this.redis.hmget(redisConn, rbacPattern, featureAttributeId);
        const active: any = JSON.parse(permission);

        if (validated) {
          data = {
            "data": [{ "active": active }]
          };
        } else {
          data = {
            "data": [{ "active": 0 }]
          };
        }
        return data;
      } else {
        commonRequest.url = `${rbacBaseUrl}${EXTERNAL_API.PR_RBAC_PERMISSIONS.replace(":userId", userId)}?appId=${appId}&attributeId=${featureAttributeId}`;
        console.log(`Call Private API - ${commonRequest.url}`)
        try {
          const response: any = await externalAPIService.get(commonRequest);
          return response;
        } catch (error) {
          const err: any = error;
          if (!err && err.code !== 404) {
            throw applicationInsightsService.errorModel(error, "getAPIAccessPermissions", this.traceFileName);
          }
        }
      }
      return null;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAPIAccessPermissions", this.traceFileName);
    }
  }
}