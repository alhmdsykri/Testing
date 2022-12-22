import { EXTERNAL_API, STATUS_CODE } from "../constants/CONSTANTS.json";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest, AzureADCrendential } from "astrafms-common-dto-interface";
import { externalAPIService } from "astrafms-services-utilities";
import { ERROR } from "../constants/MESSAGES.json";

export class MSIndentityPlatform {
  private logger: any = Logger.getLogger("./external/ms.identity.platform")
  private trace: any;
  private traceFileName: any;
  private tenantId: any | null;
  private clientId: any | null;
  private clientSecret: any | null;
  private scope: any | null;
  private scopeClientCredential: any | null;
  private resourceId: any | null;
  private appRoleId: any | null;

  constructor(azureADCrendential: AzureADCrendential | null) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.tenantId = azureADCrendential?.tenantId;
    this.clientId = azureADCrendential?.clientId;
    this.clientSecret = azureADCrendential?.secret;
    this.scope = azureADCrendential?.scope;
    this.scopeClientCredential = azureADCrendential?.scopeClientCredential;
    this.resourceId = azureADCrendential?.resourceId;
    this.appRoleId = azureADCrendential?.appRoleId
  }

  /**
   * This Function will call MS identity platform & OAuth 2.0 Resource Owner Password Credentials
   * @param commonRequest
   * @returns
   */
  public async generateOAuthv2Token(commonRequest: CommonRequest) {
    try {
      this.logger.info("generateOAuthv2Token.. start")
      // Remove JS pass by referece
      const commonReq: any = JSON.stringify(commonRequest);
      const commonReqObj: any = JSON.parse(commonReq);
      const email: any = commonReqObj.body.email;
      const password: any = commonReqObj.body.password;
      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.LOGIN_URL.replace("<tenantId>", this.tenantId);
      const reqBody: string = `client_id=${this.clientId}&client_secret=${this.clientSecret}
      &scope=${this.scope}&grant_type=password&username=${email}&password=${password}`
      commonReqObj.headers["Content-Type"] = "application/x-www-form-urlencoded";
      commonReqObj.url = url;
      commonReqObj.body = reqBody;
      const reponse: any = await externalAPIService.post(commonReqObj);
      return reponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "generateOAuthv2Token", this.traceFileName);
    }
  }

  /**
   * This Function will call MS identity platform & OAuth 2.0 Resource Owner Client Credentials
   * @param commonRequest
   * @returns
   */
  public async generateOAuthv2TokenClientCred(commonRequest: CommonRequest) {
    try {
      this.logger.info("generateOAuthv2TokenClientCred.. start")
      // Remove JS pass by referece
      const commonReq: any = JSON.stringify(commonRequest);
      const commonReqObj: any = JSON.parse(commonReq);
      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.LOGIN_URL.replace("<tenantId>", this.tenantId);
      const reqBody: string = `client_id=${this.clientId}&client_secret=${this.clientSecret}
        &scope=${this.scopeClientCredential}&grant_type=client_credentials`
      commonReqObj.headers["Content-Type"] = "application/x-www-form-urlencoded";
      commonReqObj.url = url;
      commonReqObj.body = reqBody;
      const reponse: any = await externalAPIService.post(commonReqObj);
      return reponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "generateOAuthv2TokenClientCred", this.traceFileName);
    }
  }

  public async emailValidationAzureAD(commonRequest: CommonRequest) {
    console.log("commonRequest:==>", commonRequest)
    console.log("body:==>", commonRequest.body)
    console.log("token :==>", commonRequest.body.oAuthToken)
    try {
      this.logger.info("emailValidationAzureAD.. start")
      const commonReqObj: CommonRequest = {}

      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.GET_EMAIL_URL.replace("<email>", commonRequest.body.email);
      console.log("headers before  =====> ", commonReqObj.headers)
      // tslint:disable-next-line:prefer-const
      commonReqObj.headers = {
        "Content-Type": "application/json",
        "authorization": "Bearer  " + commonRequest.body.bearerToken,
      };
      commonReqObj.url = url;

      const reponse: any = await externalAPIService.get(commonReqObj);
      return reponse;
    } catch (error) {
      console.log("emailValidationAzureAD ====>", error)
      return applicationInsightsService.errorModel(error, "emailValidationAzureAD", this.traceFileName);
    }
  }

  public async RegisterEnterprise(commonRequest: CommonRequest) {
    try {
      this.logger.info("RegisterEnterprise.. start")
      const commonReqObj: any = []
      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.ROLE_ENTERPRISE_URL.replace("<email>", commonRequest.body.email);
      commonReqObj.headers = {
        "Content-Type": "application/json",
        "authorization": "Bearer  " + commonRequest.body.bearerToken,
      };
      commonReqObj.url = url;

      commonReqObj.body = {
        "principalId": commonRequest.body.idAD,
        "resourceId": this.resourceId,
        "appRoleId": this.appRoleId
      };
      const reponse: any = await externalAPIService.post(commonReqObj);
      return reponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "RegisterEnterprise", this.traceFileName);
    }
  }

  public async generateBearerAzure(commonRequest: CommonRequest) {
    try {
      this.logger.info(" generateBearerAzure.. start")
      // Remove JS pass by referece
      const commonReq: any = JSON.stringify(commonRequest);
      const commonReqObj: any = JSON.parse(commonReq);
      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.LOGIN_AD_URL.replace("<tenantId>", this.tenantId);
      const reqBody: string = `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials&resource=${EXTERNAL_API.MS_IDENTITY_PLATFORM.RESOURCE_GRAPH}`
      commonReqObj.headers["Content-Type"] = "application/x-www-form-urlencoded";
      commonReqObj.url = url;
      commonReqObj.body = reqBody;
      const reponse: any = await externalAPIService.post(commonReqObj);
      return reponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "generateOAuthv2TokenClientCred", this.traceFileName);
    }
  }

  // async deleteRoleEnterprise
  public async deleteRoleEnterprise(commonRequest: CommonRequest) {
    try {
      this.logger.info("deleteRoleEnterprise.. start")
      const commonReqObj: any = []
      // const  emailReplaced :string = EXTERNAL_API.MS_IDENTITY_PLATFORM.DELETE_ROLE_ENTERPRISE.replace("<email>", commonRequest.body.email)
      // const idRoleReplaced :string = emailReplaced.replace("<idRoleAssignment>","0Mf7T_mbp06o_qTvWjNpoSEOoZ7F3p5DlJKi_JMzejY")
      const emailReplaced: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.DELETE_ROLE_ENTERPRISE.replace("<email>", commonRequest.body.email)
      const idRoleReplaced: string = emailReplaced.replace("<idRoleAssignment>", commonRequest.body.idRole)
      const url: string = idRoleReplaced.replace(/\s/g, "");
      console.log("url===>", url)
      commonReqObj.headers = {
        "Content-Type": "application/json",
        "authorization": "Bearer  " + commonRequest.body.bearerToken,
      };
      commonReqObj.url = url;
      const reponse: any = await externalAPIService.del(commonReqObj);
      return reponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "deleteRoleEnterprise", this.traceFileName);
    }
  }

  public async inquiryIdRoleEnterprise(commonRequest: CommonRequest) {
    try {
      this.logger.info("inquiryIdRoleEnterprise.. start")
      const commonReqObj: any = []
      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.ROLE_ENTERPRISE_URL.replace("<email>", commonRequest.body.email);
      commonReqObj.headers = {
        "Content-Type": "application/json",
        "authorization": "Bearer  " + commonRequest.body.bearerToken,
      };
      commonReqObj.url = url;
      const response: any = await externalAPIService.get(commonReqObj);
      const value = response.value
      let idRole = "";
      console.log("response inquiryIdRoleEnterprise ms idetity platform ===>", response)
      for (const item of value) {
        if (item.resourceDisplayName === 'FMS2.0-SP') {
          idRole = item.id
        }
      }
      return idRole;
    } catch (error) {
      this.logger.error(`inquiryIdRoleEnterprise Error ${error}`);
      // ==========
      throw applicationInsightsService.errorModel(error, "inquiryIdRoleEnterprise", this.traceFileName);
    }
  }

  public async postRefreshToken(commonRequest: CommonRequest) {
    try {
      this.logger.info("postRefreshToken.. start")
      const refreshToken = commonRequest.body.refreshToken;
      // Remove JS pass by referece
      const commonReq: any = JSON.stringify(commonRequest);
      const commonReqObj: any = JSON.parse(commonReq);
      const url: string = EXTERNAL_API.MS_IDENTITY_PLATFORM.LOGIN_URL.replace("<tenantId>", this.tenantId);
      const reqBody: string = `grant_type=refresh_token&client_id=${this.clientId}&client_secret=${this.clientSecret}
      &scope=${this.scope}&response_type=token&refresh_token=${refreshToken}`
      commonReqObj.headers["Content-Type"] = "application/x-www-form-urlencoded";
      commonReqObj.url = url;
      commonReqObj.body = reqBody;
      const reponse: any = await externalAPIService.postFullResp(commonReqObj);
      console.log("[ms.identity.platform].postRefreshToken========>", reponse)
      return reponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "postRefreshToken", this.traceFileName);
    }
  }

}