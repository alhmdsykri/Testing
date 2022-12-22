import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";

// tslint:disable-next-line: no-var-requires
const Vonage = require('@vonage/server-sdk')

export class NexmoOTPService {
  private logger = Logger.getLogger("./services/nexmo.otp.service");
  // private queueName: string;
  private trace: any;
  private traceFileName: any;
  private vonage: any;

  constructor(apiKey: any, apiSecret?: any) {
      this.trace = stackTrace.get();
      this.traceFileName = this.trace[0].getFileName();
      this.vonage = new Vonage({
        apiKey,
        apiSecret
      });
  }

  public async nexmoOTP(from: string, to: string, text: string) {
    let responseData: any = {};
    const result: any = this.vonage.message.sendSms(from, to, text, (err: any, responseData: any) => {
      if (err) {
          console.log(err);
          throw applicationInsightsService.errorModel(err, "nexmoOTP", this.traceFileName);
      } else {
          if(responseData.messages[0].status === "0") {
              const msg: any = "Message sent successfully.";
              console.log("@@nexmoOTP -> ", msg)
              return msg
          } else {
              const errMsg: any = `Message failed with error: ${responseData.messages[0]['error-text']}`;
              console.log("@@nexmoOTP -> ", errMsg)
              return errMsg;
          }
      }
    });
    return result;
    // try {
    //   responseData = await this.vonage.message.sendSms(from, to, text);
    // } catch (error) {
    //   throw applicationInsightsService.errorModel(error, "nexmoOTP", this.traceFileName);
    // }

  }


}