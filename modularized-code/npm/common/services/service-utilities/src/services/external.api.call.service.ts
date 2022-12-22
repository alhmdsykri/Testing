import rp from "request-promise";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest } from "astrafms-common-dto-interface";

class ExternalAPIService {
    private logger = Logger.getLogger("./utils/external.api.service");

    private trace: any;
    private traceFileName: any;

    constructor() {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
    }

    public async post(commonRequest: CommonRequest) {
        this.logger.info("HTTP POST start..");
        const url: string = commonRequest.url;
        // this.logger.info(`URL : ${url}`);
        try {
            const options = {
                url,
                method: "POST",
                json: true,
                headers: commonRequest.headers,
                body: commonRequest.body
            };
            // console.log("POST OPTIONS -->> ", options)
            let payload: any = {};
            await rp(options).then((body: any) => {
                payload = body;
            }).catch((error: any) => {
                this.logger.error("[POST] ExternalAPIService : " + JSON.stringify(error));
                throw applicationInsightsService.errorModel(this.getErrorObject(error), "post", this.traceFileName);
            });
            return payload;
        } catch (error) {
            throw applicationInsightsService.errorModel(this.getErrorObject(error), "post", this.traceFileName);
        }
    }

    public async put(commonRequest: CommonRequest) {
        this.logger.info("HTTP PUT start..");
        const url: string = commonRequest.url;
        // this.logger.info(`URL : ${url}`);
        try {
            const options = {
                url,
                method: "PUT",
                json: true,
                headers: {
                    "Authorization": commonRequest.headers.authorization,
                    "Content-Type": "application/json",
                    "transactionId": commonRequest.headers.transactionId
                },
                body: commonRequest.body
            };
            let payload: any = {};
            await rp(options).then((body: any) => {
                payload = body;
            }).catch((error: any) => {
                this.logger.error("[PUT] ExternalAPIService : " + JSON.stringify(error));
                throw applicationInsightsService.errorModel(this.getErrorObject(error), "put", this.traceFileName);
            });
            return payload;
        } catch (error) {
            throw applicationInsightsService.errorModel(this.getErrorObject(error), "put", this.traceFileName);
        }
    }

    public async get(commonRequest: CommonRequest) {
        this.logger.info("HTTP GET start..");
        const url: string = commonRequest.url;
        // this.logger.info(`URL : ${url}`);
        const query: object = commonRequest.query;
        try {
            const options = {
                url,
                method: "GET",
                json: true,
                headers: {
                    "Authorization": commonRequest.headers.authorization,
                    "Content-Type": "application/json",
                    "transactionId": commonRequest.headers.transactionId,
                    "userId": commonRequest.headers.userId
                },
            };
            let payload: any = {};
            await rp(options).then((res: any) => {
                payload = res;
            })
                .catch((error: any) => {
                    this.logger.error("[GET] ExternalAPIService : " + JSON.stringify(error));
                    // console.log(" --- ERROR OBS -----");
                    throw applicationInsightsService.errorModel(this.getErrorObject(error), "get", this.traceFileName);
                });
            return payload;
        } catch (error) {
            throw applicationInsightsService.errorModel(this.getErrorObject(error), "get", this.traceFileName);
        }
    }

    public async del(commonRequest: CommonRequest) {
        this.logger.info("HTTP DELETE start..");
        const url: string = commonRequest.url;
        // this.logger.info(`URL : ${url}`); 
        try {
            const options = {
                url,
                method: "DELETE",
                json: true,
                headers: {
                    "Authorization": commonRequest.headers.authorization,
                    "Content-Type": "application/json",
                    "transactionId": commonRequest.headers.transactionId
                },
            };
            let payload: any = {};
            await rp(options).then((res: any) => {
                payload = res;
            })
                .catch((error: any) => {
                    this.logger.error("[DEL] ExternalAPIService : " + JSON.stringify(error));
                    throw applicationInsightsService.errorModel(this.getErrorObject(error), "del", this.traceFileName);
                });
            return payload;
        } catch (error) {
            throw applicationInsightsService.errorModel(this.getErrorObject(error), "del", this.traceFileName);
        }
    }

    public getErrorObject(error: any) {
        console.log("error function: " + JSON.stringify(error.statusCode))
        console.log("error 2: " + JSON.stringify(error.error))

        let errorObj: any = {};
        if (error.error) {
            errorObj = error.error;
            if (errorObj.statusCode) {
                errorObj.code = errorObj.statusCode;
            }
        } else {
            errorObj = error;
            if (errorObj.statusCode) {
                errorObj.code = errorObj.statusCode;
            }
        }
        return errorObj;
    }

    public getErrorObjectFully(error: any) {
        console.log("error function: " + JSON.stringify(error.statusCode))
        console.log("error 2: " + JSON.stringify(error.error))

        let errorObj: any = {};
        if (error) {
            errorObj = error;
            if (errorObj.statusCode) {
                errorObj.code = errorObj.statusCode;
                errorObj.message = errorObj.message
            }
        } else {
            errorObj = error.error;
            if (errorObj.statusCode) {
                errorObj.code = errorObj.statusCode;
                errorObj.message = errorObj.message

            }
        }
        return errorObj;
    }

    public async getFullResp(commonRequest: CommonRequest) {
        this.logger.info("HTTP getFullResp start..");
        const url: string = commonRequest.url;
        // this.logger.info(`URL : ${url}`);
        const query: object = commonRequest.query;
        try {
            const options = {
                url,
                method: "GET",
                json: true,
                headers: {
                    "Authorization": commonRequest.headers.authorization,
                    "Content-Type": "application/json",
                    "transactionId": commonRequest.headers.transactionId,
                    "userId": commonRequest.headers.userId
                },
                resolveWithFullResponse: true
            };
            let payload: any = {};
            await rp(options).then((res: any) => {
                payload = {
                    "code": res.statusCode,
                    "message": res.body.message,
                };
            })
                .catch((error: any) => {
                    this.logger.error("[GET] ExternalAPIService : " + JSON.stringify(error));
                    // console.log(" --- ERROR OBS -----");
                    if (error.statusCode < 500) {
                        console.log("[GET] ExternalAPIService status code  ", error.statusCode)


                        payload = {
                            "code": error.statusCode,
                            "message": error.message,
                        };
                        return payload;

                    }

                    return applicationInsightsService.errorModel(this.getErrorObjectFully(error), "getFullResp", this.traceFileName);
                });
            return payload;
        } catch (error) {
            return applicationInsightsService.errorModel(this.getErrorObjectFully(error), "getFullResp", this.traceFileName);
        }
    }

    public async postFullResp(commonRequest: CommonRequest) {
        this.logger.info("HTTP postFullResp  start..");
        const url: string = commonRequest.url;
        // this.logger.info(`URL : ${url}`);
        console.log("BODY==>", commonRequest.body)
        console.log("HEADER==>", commonRequest.headers)

        try {
            const options = {
                url,
                method: "POST",
                json: true,
                headers: commonRequest.headers,
                body: commonRequest.body,
                resolveWithFullResponse: true

            };
            let payload: any = {};
            await rp(options).then((body: any) => {
                payload = body;
            }).catch((error: any) => {
                console.log("ERROR==>", error)
                this.logger.error("[POST] ExternalAPIService : " + JSON.stringify(error));
                payload = {
                    "statusCode": error.statusCode,
                    "message": error.message,

                }
            });
            return payload;
        } catch (error) {
            throw applicationInsightsService.errorModel(this.getErrorObject(error), "post", this.traceFileName);
        }
    }
}

export const externalAPIService = new ExternalAPIService();
