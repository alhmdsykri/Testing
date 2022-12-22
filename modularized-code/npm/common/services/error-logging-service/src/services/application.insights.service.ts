import * as applicationInsights from "applicationinsights";
import { STATUS_CODE } from "../constants/CONSTANTS.json";
import { ERROR } from "../constants/MESSAGES.json";
import { ErrorModel } from "../model/error.model";
import  Logger  from "./logger";
import { Request } from "express";
import { APPLICATION_INSIGHTS } from "../config/CONFIG.json";
import { Payload } from "astrafms-common-dto-interface";

/**
 * This service will handle the error loging on azure app insight
 */
 class ApplicationInsightsService {

    private logger = Logger.getLogger("./service/application.insights.service.ts");
    private client: any = {};

    constructor() {
        const appInsightIkey: any = process.env.APPLICATION_INSIGHTS_IKEY;
        const appInsightEnv: any = process.env.APPLICATION_INSIGHTS_ENVIRONMENT;
        if (appInsightIkey && (appInsightEnv === "production" || appInsightEnv === "development")) {
            applicationInsights.setup(appInsightIkey);
            applicationInsights.start();
            this.client = applicationInsights.defaultClient;
        } else {
            // use for UT ref: https://github.com/microsoft/ApplicationInsights-node.js/issues/368
            console.log("App Insight Fake connection for UT");
            applicationInsights.setup("<null>")
                .setAutoDependencyCorrelation(false)
                .setAutoCollectRequests(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectDependencies(false)
                .setAutoCollectConsole(false)
                .setUseDiskRetryCaching(false)
                .setInternalLogging(true, true); // we don't call start because we don't want any auto-collection
            this.client  = applicationInsights.defaultClient;
        }
    }

    public errorModel(error: any, funcName: string, fileName: string) {
        let errMessage: any = null;

        // // catch error for mongoose server error
        // console.log("X1X-ERROR -> ", error)
        // console.log("X-ERROR STRING-AP2> ", JSON.stringify(error))
        // console.log("X-ERROR NAME -->>> > ", error.name)
        // if (error && error.name === 'MongoServerError') {
        //   if (error.message.includes("E11000")) {
        //     error.code = 400;
        //     error.message = "Duplicate key error unique index constraint."
        //   }
        //   // catch error for mongoose
        //   if (error && error.name === 'ValidationError') {
        //       error.code = 400;
        //       error.toString().replace('ValidationError: ', '').split(',')
        //     }
        // }

        if (error && error.message) {
            errMessage = error.message;
        } else if (error && error.description) {
            errMessage = error.description;
        } else if (error) {
            errMessage = error;
        } else {
            errMessage = ERROR.DEFAULT.UNEXPECTED;
        }

        let errMsg: string = `Error Encountered during
        ${funcName} (${fileName}) ${errMessage} `;

        if (error && error.appInsightRaw) {
            errMsg = error.appInsightRaw;
        } else {
            errMsg = error;
        }

        if (error && error.code && !Number.isInteger(error.code)) {
            error.code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        }

        if (!error || !error.code) {
            error.code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        }

        if (!error && !error.code) {
            error.code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        }

        let code: any = null;
        if (!error) {
            code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        } else if (error && error.code) {
            code = error.code;
        } else {
            code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        }

     // Error code transform if exceeds code was unexpected
     if (code < 100 || code > 599) {
        code = 400;
    }

    console.log(`-=-= ${funcName} AP ErrorModel ->> `, errMsg);
    this.logger.error(`${funcName} error ${error}`);
    return new ErrorModel(
        code,
        errMessage,
        "",
        errMsg
    );
   }

    public logError(req: Request, err: any) {

        let transactionid: any = (req.headers && (req.headers.transactionid || req.headers.transactionId))
        ? `${String(req.headers.transactionid || req.headers.transactionId)}]` : "";
        transactionid = (req.body && (req.body.transactionid || req.body.transactionId))
        ? `${String(req.body.transactionid || req.body.transactionId)}]` : "";
        try {
            let erroMessage: any;
            if (err.code && !Number.isInteger(err.code)) {
                err.code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
            }
            if (err) {
                if (err && err.appInsightRaw) {
                    erroMessage = err.appInsightRaw;
                } else if (err && err.message) {
                    erroMessage = err.message;
                } else if (err && err.description) {
                    erroMessage = err.description;
                } else if (err) {
                    erroMessage = err;
                } else {
                    erroMessage = ERROR.DEFAULT.UNEXPECTED;
                }


                this.client.trackException({exception: erroMessage});
            }
            return this.payloadResponse(req, err);
        } catch (error) {
            let errMsg = `${transactionid} Error Encountered during app insights logError `;
            if (typeof (error) === "object") {
                errMsg += JSON.stringify(error);
            } else {
                errMsg += error;
            }
            this.logger.error(errMsg);
            return this.payloadResponse(req, error);
        }
    }

    public faLogError(req: Request, err: any) {
				console.log("-=-=-=-=--=-= faLogError =-=-=-=-= start")
        let transactionid: any = (req.headers && (req.headers.transactionid || req.headers.transactionId))
        ? `${String(req.headers.transactionid || req.headers.transactionId)}]` : "";
        transactionid = (req.body && (req.body.transactionid || req.body.transactionId))
        ? `${String(req.body.transactionid || req.body.transactionId)}]` : "";
        try {
            let erroMessage: any;
            if (err.code && !Number.isInteger(err.code)) {
                err.code = STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR;
            }
            if (err) {
                if (err && err.appInsightRaw) {
                    erroMessage = err.appInsightRaw;
                } else if (err && err.message) {
                    erroMessage = err.message;
                } else if (err && err.description) {
                    erroMessage = err.description;
                } else if (err) {
                    erroMessage = err;
                } else {
                    erroMessage = ERROR.DEFAULT.UNEXPECTED;
                }

                this.client.trackException({exception: erroMessage});
            }
						console.log("-=-=-=-=--=-= faLogError =-=-=-=-= END")
            return new ErrorModel(err.code || STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR,
							err.message || ERROR.DEFAULT.UNEXPECTED,
							transactionid,
							err)
        } catch (error) {
            return error;
        }
    }

    private payloadResponse(req: Request, error: any) {
        return new Payload(
            error.code || STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            new ErrorModel(error.code || STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                error.message || ERROR.DEFAULT.UNEXPECTED,
                req.headers.transactionid as string)
        );
    }

}

export const applicationInsightsService = new ApplicationInsightsService();

