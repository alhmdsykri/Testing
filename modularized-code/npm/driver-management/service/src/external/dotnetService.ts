import { EXTERNAL_API, STATUS_CODE } from "../constants/CONSTANTS.json";
import * as stackTrace from "stack-trace";
import { Logger, applicationInsightsService } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import { externalAPIService } from "astrafms-services-utilities";

export class DotnetService {
    private logger: any = Logger.getLogger("./external/DotnetService")
    private trace: any;
    private traceFileName: any;

    constructor() {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
    }

    public async getExternalCompanyById(commonRequest: CommonRequest) {
        try {
            this.logger.info("getExternalCompanyById... start")
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_COMPANY_BY_ID.replace("<companyId>", commonRequest.body.companyId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            };
        } catch (error) {
            this.logger.error("getExternalCompanyById", error);
            throw applicationInsightsService.errorModel(error, "getExternalCompanyById", this.traceFileName);

        }
    }

    public async getExternalBranchById(commonRequest: CommonRequest) {
        try {
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_BRANCH_BY_ID.replace("<branchId>", commonRequest.body.branchId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            };
        } catch (error) {
            this.logger.error("getExternalBranchById", error);
            throw applicationInsightsService.errorModel(error, "getExternalBranchById", this.traceFileName);

        }
    }

    public async getExternalPersonnelAreaIdById(commonRequest: CommonRequest) {
        try {
            this.logger.info("getExternalPersonnelAreaIdById.. start")
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_BRANCH_BY_ID.replace("<branchId>", commonRequest.body.personnelAreaId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            };
        } catch (error) {
            this.logger.error("getExternalPersonnelAreaIdById", error);
            throw applicationInsightsService.errorModel(error, "getExternalPersonnelAreaIdById", this.traceFileName);

        }
    }

    public async getExternalBUById(commonRequest: CommonRequest) {
        try {
            this.logger.info("getExternalBUById.. start")
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_BU_BY_ID.replace("<BUId>", commonRequest.body.businessUnitId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            }
        } catch (error) {
            this.logger.error(`getExternalBUById ${error}`);
            throw applicationInsightsService.errorModel(error, "getExternalPoolByLocationId", this.traceFileName);
        }
    }

    public async getExternalPoolByLocationId(commonRequest: CommonRequest) {
        try {
            this.logger.info("getExternalPoolByLocationId.. start")
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_POOL_BY_LOC_ID.replace("<locId>", commonRequest.body.poolId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId

            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            };
        } catch (error) {
            this.logger.error(`getExternalPoolByLocationId ${error}`);
            throw applicationInsightsService.errorModel(error, "getExternalPoolByLocationId", this.traceFileName);
        }
    }

    public async getExternalCicoPoolById(commonRequest: CommonRequest, tempCpString: string) {
        try {
            this.logger.info("getExternalCicoPoolById.. start")
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_CICO_POOL_BY_LOC_ID.replace("<locId>", tempCpString);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId,
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            }
        } catch (error) {
            this.logger.error(`getExternalCicoPoolById ${error}`);
            throw applicationInsightsService.errorModel(error, "getExternalCicoPoolById", this.traceFileName);
        }
    }

    public async getExternalCustomerById(commonRequest: CommonRequest) {
        try {
            this.logger.info("getExternalCustomerById.. start")
            const commonReqObj: CommonRequest = new CommonRequest();
            const url: string = EXTERNAL_API.GET_CUSTOMER_BY_ID.replace("<customerId>", commonRequest.body.customerId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": commonRequest.headers.userId,
                "transactionId": commonRequest.headers.transactionId
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.get(commonReqObj);
            return {
                code: STATUS_CODE.SUCCESS.OK,
                data: response.data
            }
        } catch (error) {
            this.logger.error(`getExternalBUById ${error}`);
            throw applicationInsightsService.errorModel(error, "getExternalPoolByLocationId", this.traceFileName);
        }
    }
}