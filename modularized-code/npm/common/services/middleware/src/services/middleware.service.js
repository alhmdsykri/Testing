"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareService = void 0;
const CONSTANTS_json_1 = require("../constants/CONSTANTS.json");
const stackTrace = __importStar(require("stack-trace"));
const astrafms_services_error_logging_1 = require("astrafms-services-error-logging");
const astrafms_services_utilities_1 = require("astrafms-services-utilities");
const redis_1 = require("../redis/redis");
const _ = __importStar(require("lodash"));
class MiddlewareService {
    constructor(redisHost, redisKey) {
        this.logger = astrafms_services_error_logging_1.Logger.getLogger("./services/middleware.service");
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        this.redis = new redis_1.Redis(null, null);
        if (redisHost) {
            this.redis = new redis_1.Redis(redisHost, redisKey);
        }
    }
    getDataRbac(commonRequest) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info(`getDataRbac...start `);
            try {
                // console.log("getAPIAccessPermissions --> ", commonRequest)
                let userDataRbac = {};
                const rbacBaseUrl = (_a = commonRequest.headers) === null || _a === void 0 ? void 0 : _a.rbacBaseURL;
                const userId = ((_b = commonRequest.headers) === null || _b === void 0 ? void 0 : _b.userId) ? (_c = commonRequest.headers) === null || _c === void 0 ? void 0 : _c.userId : null;
                // Check Redis Cache
                const redisConn = yield this.redis.getCacheConnection();
                const dRbacPattern = CONSTANTS_json_1.REDIS_CACHE.DRBAC.USER_HASH_KEY;
                const dataRbacs = yield this.redis.hmget(redisConn, dRbacPattern, userId);
                if (dataRbacs && Array.isArray(dataRbacs) && dataRbacs.length >= 1) {
                    userDataRbac = JSON.parse(dataRbacs[0]);
                    if (!userDataRbac) {
                        console.log("Call Private API - /api/user/v1/data-rbac/:userId");
                        commonRequest.url = rbacBaseUrl + CONSTANTS_json_1.EXTERNAL_API.PR_DATA_RBAC.replace(":userId", userId);
                        try {
                            const reponse = yield astrafms_services_utilities_1.externalAPIService.get(commonRequest);
                            if (reponse && reponse.data) {
                                return reponse.data;
                            }
                            else {
                                return null;
                            }
                        }
                        catch (error) {
                            const err = error;
                            if (!err && err.code !== 404) {
                                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "getDataRbac", this.traceFileName);
                            }
                        }
                    }
                }
                else {
                    return null;
                }
                return userDataRbac;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "getDataRbac", this.traceFileName);
            }
        });
    }
    getAPIAccessPermissions(commonRequest, featureAttributeId) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info(`getAPIAccessPermissions...start -> ${featureAttributeId}`);
            try {
                let data = {};
                const appId = (_a = commonRequest.headers) === null || _a === void 0 ? void 0 : _a.appId;
                const rbacBaseUrl = (_b = commonRequest.headers) === null || _b === void 0 ? void 0 : _b.rbacBaseURL;
                const userId = ((_c = commonRequest.headers) === null || _c === void 0 ? void 0 : _c.userId) ? (_d = commonRequest.headers) === null || _d === void 0 ? void 0 : _d.userId : null;
                // Check Redis Cache
                const redisConn = yield this.redis.getCacheConnection();
                let rbacPattern = CONSTANTS_json_1.REDIS_CACHE.RBAC.USER_HASH_NAME;
                rbacPattern = rbacPattern.replace("userId", String(userId));
                const rbacLength = yield this.redis.hlen(redisConn, rbacPattern);
                if (rbacLength >= 1) {
                    console.log("Resource RBAC from REDIS Cache");
                    const userRbacKeys = yield this.redis.hkeys(redisConn, rbacPattern);
                    const validated = _.includes(userRbacKeys, featureAttributeId);
                    const permission = yield this.redis.hmget(redisConn, rbacPattern, featureAttributeId);
                    const active = JSON.parse(permission);
                    if (validated) {
                        data = {
                            "data": [{ "active": active }]
                        };
                    }
                    else {
                        data = {
                            "data": [{ "active": 0 }]
                        };
                    }
                    return data;
                }
                else {
                    commonRequest.url = `${rbacBaseUrl}${CONSTANTS_json_1.EXTERNAL_API.PR_RBAC_PERMISSIONS.replace(":userId", userId)}?appId=${appId}&attributeId=${featureAttributeId}`;
                    console.log(`Call Private API - ${commonRequest.url}`);
                    try {
                        const response = yield astrafms_services_utilities_1.externalAPIService.get(commonRequest);
                        return response;
                    }
                    catch (error) {
                        const err = error;
                        if (!err && err.code !== 404) {
                            throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "getAPIAccessPermissions", this.traceFileName);
                        }
                    }
                }
                return null;
            }
            catch (error) {
                throw astrafms_services_error_logging_1.applicationInsightsService.errorModel(error, "getAPIAccessPermissions", this.traceFileName);
            }
        });
    }
}
exports.MiddlewareService = MiddlewareService;
//# sourceMappingURL=middleware.service.js.map