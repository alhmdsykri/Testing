import { EXTERNAL_API, STATUS_CODE } from "../constants/CONSTANTS.json";
import * as stackTrace from "stack-trace";
import { Logger, applicationInsightsService } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";
import { externalAPIService } from "astrafms-services-utilities";

export class ExternalService {
    private logger: any = Logger.getLogger("./external/external.service")
    private trace: any;
    private traceFileName: any;

    constructor() {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
    }

    public async getExternalPersonalIdValidation(commonRequest: CommonRequest) {
        try {
            this.logger.info("getExternalPersonalIdValidation... start");
            const commonReqObj: CommonRequest = new CommonRequest();

            const url: string = EXTERNAL_API.DRIVER_SERVICE.GET_PERSONAL_BY_ID.replace("<personalDataId>", commonRequest.body.personalId);
            commonReqObj.headers = {
                "Content-Type": "application/json",
                "userId": EXTERNAL_API.USER_ID_SUPERADMIN,
                "transactionId": commonRequest.headers.transactionId
            };
            commonReqObj.url = url;
            const response: any = await externalAPIService.getFullResp(commonReqObj);
            return {
                code: response.code,
                message: response.message
            }
        } catch (error) {
            this.logger.error("getExternalPersonalIdValidation", error);
            return applicationInsightsService.errorModel(error, "getExternalPersonalIdValidation", this.traceFileName);

        }
    }
}