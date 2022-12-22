import { STATUS_CODE, REDIS_CACHE, PBAC, EXTERNAL_API, LOCALHOST } from "../constants/CONSTANTS.json";
import { ERROR, SUCCESS } from "../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest, AzureADCrendential, CommonResponseDto, ICreateRole, IPermissions, CommonResponseListDto } from "astrafms-common-dto-interface";
import { PbacPermissionDto } from "../dto/pbac.permission.dto";
import { UserDao } from "astrafms-db-mssql-user-management";
import { externalAPIService } from "astrafms-services-utilities";
import { LoginResponseDto } from "../dto/login.response.dto";
import { EnterpriseResponseDto } from "../dto/enterpise.response.dto";
import { RefreshTokenResponseDto } from "../dto/refresh.token.response.dto"

import { LoginPersonalIdResponseDto } from "../dto/login.response.personal.id.dto";
import { MSIndentityPlatform } from "../external/ms.identity.platform";

import { ExternalService } from "../external/external.service";

// import utf8 from 'utf8';
import * as crypto from "crypto";


import * as _ from "lodash";
import { listenerCount } from "process";
// tslint:disable-next-line:no-var-requires
const jwtDecode = require("jwt-decode");

export class UserAuthService {
  private logger: any = Logger.getLogger("./services/user.auth.service")
  private trace: any;
  private traceFileName: any;
  private azureADCrendential: AzureADCrendential | null;
  private userDao: UserDao;
  private externalService: ExternalService;

  constructor(azureADCrendential: AzureADCrendential | null) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.azureADCrendential = azureADCrendential;
    this.userDao = new UserDao(null, null, null, null);
    this.externalService = new ExternalService()
  }

  public async postLoginAuthenticate(commonRequest: CommonRequest, userService: any) {
    this.logger.info(`postLoginAuthenticate...star`);
    const transactionId: any = commonRequest.headers?.transactionId;
    try {
      const msIndentityPlatform: MSIndentityPlatform = new MSIndentityPlatform(this.azureADCrendential);
      let oAuthToken: any = {};
      try {
        oAuthToken = await msIndentityPlatform.generateOAuthv2Token(commonRequest);
        if (oAuthToken && oAuthToken.access_token) {
          const jwtData = jwtDecode(oAuthToken.access_token);
          const roles: any[] = jwtData.roles;
          if (roles && Array.isArray(roles) && roles.length > 0) {
            if (this.hasAllowAppRole(jwtData)) {
              console.log(`User has app role `, roles)
            } else {
              const errMsg: any = ERROR.RESOURCE.APP_ROLE_NOT_ALLOWED;
              console.log(errMsg)
              return new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, errMsg, transactionId);
            }
          } else {
            // Missing roles
            const errMsg: any = ERROR.RESOURCE.APP_ROLE_NOT_FOUND;
            console.log(errMsg)
            return new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, errMsg, transactionId);
          }
        } else {
          // Missing Access Token
          const errMsg: any = ERROR.DEFAULT.ACCESS_TOKEN_NOT_FOUND
          return new ErrorModel(STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED, errMsg, transactionId);
        }
      } catch (error) {
        // MS Platform Error
        this.logger.error(`MS Platform Error ${error}`);
        const err: any = await this.processError(commonRequest, error, userService);
        if (!(err instanceof ErrorModel)) {
          return {
            code: STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
            transactionId: commonRequest.headers?.transactionId,
            message: err.message,
            failedLoginAttempt: err.failedLoginAttempt
          }
        }
        throw applicationInsightsService.errorModel(err, "postLoginAuthenticate", this.traceFileName);
      }

      const loginResponseDto: LoginResponseDto = new LoginResponseDto();
      loginResponseDto.transactionId = commonRequest.headers?.transactionId;
      loginResponseDto.code = STATUS_CODE.SUCCESS.OK;
      loginResponseDto.userId = commonRequest.headers?.userId;
      loginResponseDto.message = SUCCESS.USER_AUTHENTICATED;
      loginResponseDto.expiresIn = oAuthToken?.expires_in;
      loginResponseDto.accessToken = oAuthToken?.access_token;
      loginResponseDto.refreshToken = oAuthToken?.refresh_token;
      return loginResponseDto;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "postLoginAuthenticate", this.traceFileName);
    }
  }

  /**
   * This function validates if use have at lease one allowed app role in access token
   * @param jwtData Decoded jwt token as an object
   * @returns Boolean
   */
  public hasAllowAppRole(jwtData: any) {
    const tokenRoles: any[] = jwtData.roles;
    let isFound: boolean = false;
    const adAccessTokenRoles: any = process.env.AD_ALLOW_ACCESS_TOKEN_ROLES || null;
    // converts string comma with array
    const accTokenRoles: any = adAccessTokenRoles
      .split(/[ ,]+/)
      .map((role: any) => role.trim());
    if (Array.isArray(tokenRoles) && tokenRoles.length > 0
      && Array.isArray(accTokenRoles) && accTokenRoles.length > 0) {
      accTokenRoles.forEach((role: any) => {
        tokenRoles.forEach((tokenRole: any) => {
          console.log(`Matching ${role} = ${tokenRole}`)
          if (role === tokenRole) {
            isFound = true;
          }
        });
      });
    }
    return isFound;
  }

  public async createSharedAccessToken(commonRequest: CommonRequest) {
    try {
      this.logger.info("createSharedAccessToken.. start");
      const sharedKeyName: string = commonRequest.headers.sharedKeyName;
      const sharedKey: string = commonRequest.headers.sharedKey;
      const uri: string = commonRequest.headers.url;

      if (!uri || !sharedKey || !sharedKeyName) {
        return {
          code: STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          transactionId: commonRequest.headers?.transactionId,
          message: "Invalid, missing required parameter"
        };
      }
      const encoded = encodeURIComponent(uri);
      const now = new Date();
      const hour = 60 * 60;
      const ttl = Math.round(now.getTime() / 1000) + hour;
      const signature = encoded + '\n' + ttl;

      const hash = crypto.createHmac('sha256', sharedKey).update(signature).digest('base64');

      return {
        code: STATUS_CODE.SUCCESS.OK,
        transactionId: commonRequest.headers?.transactionId,
        message: "Success generate SAS Token",
        expiryOn: ttl,
        sasToken: 'SharedAccessSignature sr=' + encoded + '&sig=' +
          encodeURIComponent(hash) + '&se=' + ttl + '&skn=' + sharedKeyName
      };

    } catch (error) {
      return applicationInsightsService.errorModel(error, "createSharedAccessToken", this.traceFileName);
    }
  }

  public async checkUser(commonRequest: CommonRequest) {
    try {
      this.logger.info("checkUser.. start");
      const result: any = await this.userDao.getUserByEmailExternal(commonRequest);
      if (result.data !== null) {
        return {
          code: STATUS_CODE.SUCCESS.OK,
          message: "Success",
          ...result
        };
      }
      else {
        return {
          code: STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          transactionId: result.transactionId,
          message: "Invalid, email not found"
        };
      }
    } catch (error) {
      return applicationInsightsService.errorModel(error, "checkUser", this.traceFileName);
    }
  }

  public async validateUser(commonRequest: CommonRequest, checkUser: any) {
    try {
      this.logger.info("validateUser.. start");
      const password: string = commonRequest.body?.password;
      const salt = checkUser.salt;

      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

      if (hash === checkUser.password) {
        return {
          code: STATUS_CODE.SUCCESS.OK,
          transactionId: commonRequest.headers?.transactionId,
          message: "Success",
        };
      } else {
        return {
          code: STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          transactionId: commonRequest.headers?.transactionId,
          message: "Invalid, wrong password",
        };
      }

    } catch (error) {
      return applicationInsightsService.errorModel(error, "validateUser", this.traceFileName);
    }
  }

  public async hashPassword(commonRequest: CommonRequest) {
    try {
      this.logger.info("hashPassword.. start");
      const password: string = commonRequest.body.password;
      console.log(commonRequest.body);

      // Creating a unique salt for a particular user
      const salt: string = crypto.randomBytes(16).toString('hex');

      // Hashing user's salt and password with 1000 iterations
      const hash: string = crypto.pbkdf2Sync(password, salt,
        1000, 64, `sha512`).toString(`hex`);

      return {
        code: STATUS_CODE.SUCCESS.OK,
        transactionId: commonRequest.headers?.transactionId,
        message: "Success",
        hash,
        salt
      };

    } catch (error) {
      return applicationInsightsService.errorModel(error, "hashPassword", this.traceFileName);
    }
  }

  public async postLoginAuthenticatePersonalId(commonRequest: CommonRequest, userService: any) {
    this.logger.info(`postLoginAuthenticatePersonalId...star`);
    try {
      const msIndentityPlatform: MSIndentityPlatform = new MSIndentityPlatform(this.azureADCrendential);
      let oAuthToken: any = {};
      try {
        oAuthToken = await msIndentityPlatform.generateOAuthv2TokenClientCred(commonRequest);
      } catch (error) {
        // MS Platform Error
        this.logger.error(`MS Platform Error ${error}`);
        // const err: any = await this.processError(commonRequest, error, userService);
        // if (!(err instanceof ErrorModel)) {
        //   return {
        //     code: STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
        //     transactionId: commonRequest.headers?.transactionId,
        //     message: err.message,
        //     failedLoginAttempt: err.failedLoginAttempt
        //   }
        // }
        throw applicationInsightsService.errorModel(error, "postLoginAuthenticatePersonalId", this.traceFileName);
      }

      const loginPersonalIdResponseDto: LoginPersonalIdResponseDto = new LoginPersonalIdResponseDto();
      loginPersonalIdResponseDto.transactionId = commonRequest.headers?.transactionId;
      loginPersonalIdResponseDto.code = STATUS_CODE.SUCCESS.OK;
      loginPersonalIdResponseDto.userId = commonRequest.headers?.userId;
      loginPersonalIdResponseDto.message = SUCCESS.USER_AUTHENTICATED;
      loginPersonalIdResponseDto.expiresIn = oAuthToken?.expires_in;
      loginPersonalIdResponseDto.accessToken = oAuthToken?.access_token;
      return loginPersonalIdResponseDto;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "postLoginAuthenticatePersonalId", this.traceFileName);
    }
  }

  private async processError(commonRequest: CommonRequest, error: any, userService: any) {
    const transactionId: any = String(commonRequest.headers?.transactionId);
    const errorModel: ErrorModel = error;
    errorModel.transactionId = transactionId;
    if (errorModel.message?.error === "invalid_grant") {
      const userSLoginStatus: any = await userService.updateLoginStatus(commonRequest);
      if (userSLoginStatus.data?.isSuspended) {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED, ERROR.LOGIN.USER_SUSPENDED, transactionId);
      }
      return {
        code: STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
        userId: userSLoginStatus.data?.userId,
        failedLoginAttempt: userSLoginStatus.data?.failedLoginAttempt,
        message: ERROR.LOGIN.INVALUD_USER_PASS,
      }
      // return new ErrorModel(STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED, ERROR.LOGIN.INVALUD_USER_PASS, transactionId);
    } else {
      const errMsg: any = `${errorModel.message?.error} ${ERROR.DEFAULT.INTERNAL_API_ERROR}`
      return new ErrorModel(STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR, errMsg, transactionId, errorModel.message);
    }
  }

  // RegisterEnterprise
  public async RegisterEnterprise(commonRequest: CommonRequest) {
    this.logger.info(`RegisterEnterprise...star`);
    const msIndentityPlatform: MSIndentityPlatform = new MSIndentityPlatform(this.azureADCrendential);

    let bearerToken: any = {};
    try {
      bearerToken = await msIndentityPlatform.generateBearerAzure(commonRequest);
    } catch (error) {
      // MS Platform Error
      this.logger.error(`MS Platform Error ${error}`);
      throw applicationInsightsService.errorModel(error, "RegisterEnterprise", this.traceFileName);
    }
    try {
      commonRequest.body.bearerToken = bearerToken.access_token
      let response: any = {};
      try {
        response = await msIndentityPlatform.RegisterEnterprise(commonRequest);
      } catch (error) {
        // MS Platform Error
        const err: any = error;
        if (err.message?.error.code === 'Request_BadRequest') {
          return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.NEW_USER.ALREADY_EXIST, commonRequest.headers?.transactionId);
        }
        this.logger.error(`RegisterEnterprise Error ${error}`);
        throw applicationInsightsService.errorModel(error, "[UserAuthService].RegisterEnterprise", this.traceFileName);
      }
      const enterpriseResponseDto: EnterpriseResponseDto = new EnterpriseResponseDto();
      enterpriseResponseDto.transactionId = commonRequest.headers?.transactionId;
      enterpriseResponseDto.code = STATUS_CODE.SUCCESS.OK;
      enterpriseResponseDto.userId = commonRequest.headers?.userId;
      enterpriseResponseDto.message = "Success register";
      enterpriseResponseDto.email = response.email;
      return enterpriseResponseDto;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "[msIndentityPlatform].RegisterEnterprise", this.traceFileName);
    }
  }

  public async validateEmaliAD(commonRequest: CommonRequest) {
    this.logger.info(`vslidateEmaliAD...start`);
    try {
      const msIndentityPlatform: MSIndentityPlatform = new MSIndentityPlatform(this.azureADCrendential);
      let bearerToken: any = {};
      try {
        bearerToken = await msIndentityPlatform.generateBearerAzure(commonRequest);
      } catch (error) {
        // MS Platform Error
        this.logger.error(`MS Platform Error ${error}`);
        throw applicationInsightsService.errorModel(error, "validateEmaliAD", this.traceFileName);
      }
      // find email
      try {
        commonRequest.body.bearerToken = bearerToken.access_token
        const resultValidation = await msIndentityPlatform.emailValidationAzureAD(commonRequest);
        return resultValidation
      } catch (error) {
        // MS Platform Error
        this.logger.error(`MS Platform Error ${error}`);
        throw applicationInsightsService.errorModel(error, "validateEmaliAD", this.traceFileName);
      }
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "validateEmaliAD", this.traceFileName);
    }
  }

  public async getCsrfToken(commonRequest: CommonRequest) {
    try {
      this.logger.info("getCsrfToken.. start");
      const commonReqObj: CommonRequest = {}

      const url: string = LOCALHOST.URL_CSRF_KEY;
      // tslint:disable-next-line:prefer-const
      commonReqObj.headers = {
        "Content-Type": "application/json",
        "authorization": "Bearer  " + commonRequest.body.bearerToken,
      };
      commonReqObj.url = url;

      const reponse: any = await externalAPIService.get(commonReqObj);
      return reponse;
    } catch (error) {
      return applicationInsightsService.errorModel(error, "getCsrfToken", this.traceFileName);
    }
  }

  // delete role emterprise
  public async deleteRoleEnterprise(commonRequest: CommonRequest) {
    this.logger.info(`deleteRoleEnterprise...star`);
    const msIndentityPlatform: MSIndentityPlatform = new MSIndentityPlatform(this.azureADCrendential);

    let bearerToken: any = {};
    try {

      bearerToken = await msIndentityPlatform.generateBearerAzure(commonRequest);
    } catch (error) {
      // MS Platform Error
      this.logger.error(`MS Platform Error ${error}`);
      throw applicationInsightsService.errorModel(error, "generateBearerAzure", this.traceFileName);
    }
    try {
      commonRequest.body.bearerToken = bearerToken.access_token
      const idRole = await msIndentityPlatform.inquiryIdRoleEnterprise(commonRequest);
      if (idRole.length > 0) {
        commonRequest.body = {
          idRole,
          bearerToken: bearerToken.access_token,
          email: commonRequest.body.email
        };
        let response: any = {};
        try {
          response = await msIndentityPlatform.deleteRoleEnterprise(commonRequest);

        } catch (error) {
          // MS Platform Error
          const err: any = error;
          if (err.message?.error.code === 'Request_BadRequest') {
            return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.NEW_USER.ALREADY_EXIST, commonRequest.headers?.transactionId);
          }
          this.logger.error(`deleteRoleEnterprise Error ${error}`);
          throw applicationInsightsService.errorModel(error, "[UserAuthService].deleteRoleEnterprise", this.traceFileName);
        }
        const enterpriseResponseDto: EnterpriseResponseDto = new EnterpriseResponseDto();
        enterpriseResponseDto.transactionId = commonRequest.headers?.transactionId;
        enterpriseResponseDto.code = STATUS_CODE.SUCCESS.OK;
        enterpriseResponseDto.userId = commonRequest.headers?.userId;
        enterpriseResponseDto.message = "Success delete Role Enterprise";
        return enterpriseResponseDto;
      } else {
        let enterpriseResponseDto: EnterpriseResponseDto;
        enterpriseResponseDto = new EnterpriseResponseDto();
        enterpriseResponseDto.transactionId = commonRequest.headers?.transactionId;
        enterpriseResponseDto.code = STATUS_CODE.SUCCESS.OK;
        enterpriseResponseDto.userId = commonRequest.headers?.userId;
        enterpriseResponseDto.message = "Success delete Role Enterprise";
        return enterpriseResponseDto;
      }
    } catch (error) {
      // Request_ResourceNotFound
      // =========
      // MS Platform Error
      const err: any = error;
      if (err.message?.error.code === 'Request_ResourceNotFound') {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.NEW_USER.EMAIL_NOT_FOUND, commonRequest.headers?.transactionId);
      }
      throw applicationInsightsService.errorModel(error, "[msIndentityPlatform].deleteRoleEnterprise", this.traceFileName);
    }
  }

  public async postRefreshToken(commonRequest: CommonRequest) {
    this.logger.info(`postRefreshToken...star`);
    try {
      const transactionId: string = commonRequest.headers?.transactionId;
      const msIndentityPlatform: MSIndentityPlatform = new MSIndentityPlatform(this.azureADCrendential);
      let RefreshTokenResult: any = {};

      RefreshTokenResult = await msIndentityPlatform.postRefreshToken(commonRequest);
      if (RefreshTokenResult.statusCode === STATUS_CODE.SUCCESS.OK) {
        const refreshTokenResponseDto: RefreshTokenResponseDto = {
          transactionId,
          statusCode: RefreshTokenResult.statusCode,
          message: SUCCESS.USER_AUTHENTICATED,
          accessToken: RefreshTokenResult.body.access_token,
          refreshToken: RefreshTokenResult.body.refresh_token,
          idToken: RefreshTokenResult.body.id_token
        }
        return refreshTokenResponseDto
      }
      if (RefreshTokenResult.statusCode === STATUS_CODE.CLIENT_ERROR.BAD_REQUEST) {
        const refreshTokenResponseDto: RefreshTokenResponseDto = {
          transactionId,
          statusCode: RefreshTokenResult.statusCode,
          message: ERROR.REFRESH_TOKEN.BAD_REQUEST,

        }
        return refreshTokenResponseDto
      } else {
        return RefreshTokenResult

      }

    } catch (error) {

      throw applicationInsightsService.errorModel(error, "postRefreshToken", this.traceFileName);
    }
  }

  public async checkDriver(commonRequest: CommonRequest) {
    try {
      const result: any = await this.externalService.getExternalPersonalIdValidation(commonRequest);
      return result;
    } catch (error) {
      console.log("@@ error  -->> ", error);
      return applicationInsightsService.errorModel(
        error,
        "checkDriver",
        this.traceFileName
      );
    }
  }
}