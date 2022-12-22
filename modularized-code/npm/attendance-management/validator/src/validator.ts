import { STATUS_CODE } from "./constants/CONSTANTS.json";
import { SUCCESS, ERROR } from "./constants/MESSAGES.json";
import { applicationInsightsService, Logger, ErrorModel, ErrorWithDataModel } from 'astrafms-services-error-logging';
import { CommonRequest, CommonResponseDto, CommonResponseListDto, ResponseDataDto } from "astrafms-common-dto-interface";
export class RequestValidator {
  private logger: any = Logger.getLogger("./validator.ts");
  private trace: any;
  private traceFileName: any;

  // -=-=-=-=-=---=- COMMON -=-=-=-=-=-=-- //

  public async validateHeaders(commonRequest: CommonRequest) {
    this.logger.info("validateHeaders...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const userId: string = commonRequest.headers.userId;
    console.log("userId: " + userId);

    try {
      if (!transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (!userId || userId == "undefined" || Object.keys(userId).length === 0) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateHeaders",
        this.traceFileName
      );
    }
  }

  public async validateFatigueQuestion(commonRequest: CommonRequest) {
    this.logger.info("validateFatigueQuestion start");
    const transactionId: string = commonRequest.headers.transactionId;
    const {
      numberOfSelfCondition,
      numberOfKnowledge,
      numberOfDeclaration,
    }: any = commonRequest.query;
    try {
      if (
        !numberOfSelfCondition ||
        typeof Number(numberOfSelfCondition) !== "number" ||
        numberOfSelfCondition <= 0
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.FATIGUE_QUESTION.NUMBER_OF_SELF_CONDITION,
          transactionId
        );
      }
      if (
        !numberOfKnowledge ||
        typeof Number(numberOfKnowledge) !== "number" ||
        numberOfKnowledge <= 0
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.FATIGUE_QUESTION.NUMBER_OF_KNOWLEDGE,
          transactionId
        );
      }
      if (
        !numberOfDeclaration ||
        typeof Number(numberOfDeclaration) !== "number" ||
        numberOfDeclaration <= 0
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.FATIGUE_QUESTION.NUMBER_OF_DECLARATION,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateFatigueQuestion",
        this.traceFileName
      );
    }
  }

  public async validateSubmitFatigueQuestion(commonRequest: CommonRequest, queryService: any) {
    this.logger.info("validateSubmitFatigueQuestion start");
    const transactionId: string = commonRequest.headers.transactionId;
    const {
      personalDataId,
      interviewTimestamp,
      totalScore,
      minScore,
      isPassed,
      fatigueStatusId,
    }: any = commonRequest.body;
    const checkInterviewTimestampRegex: any = /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2]\d|3[0-1])T(?:[0-1]\d|2[0-3]):[0-5]\d:[0-5]\dZ/;

    if (!interviewTimestamp || typeof (interviewTimestamp) !== "string") {
      return new ErrorModel(
        STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
        ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.INTERVIEW_TIMESTAMP,
        transactionId
      );
    }

    try {
      if (
        !personalDataId || typeof personalDataId !== "number" ||
        typeof Number(personalDataId) !== "number" ||
        personalDataId <= 0
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.PERSONAL_DATA_ID,
          transactionId
        );
      }
      const validatePersonalId = await queryService.getExternalPersonalIdValidation(commonRequest);
      if (validatePersonalId.code !== STATUS_CODE.SUCCESS.OK) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.PERSONAL_DATA_ID_NOT_FOUND,
          transactionId
        );
      }


      if (!interviewTimestamp.match(checkInterviewTimestampRegex)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.INTERVIEW_TIMESTAMP,
          transactionId
        );
      }
      const timesSubmit = await queryService.submitTimeValidation(commonRequest)
      if (timesSubmit.length > 0) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.SUBMITTED,
          transactionId
        );
      }
      if (!minScore || typeof minScore !== "number") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.MIN_SCORE,
          transactionId
        );
      }
      if (!totalScore || typeof totalScore !== "number") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.TOTAL_SCORE,
          transactionId
        );
      }
      if (isPassed == "undefined" || typeof isPassed !== "boolean") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.IS_PASSED,
          transactionId
        );
      }
      if (fatigueStatusId == "undefined" || typeof fatigueStatusId !== "number") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.FATIGUE_STATUS_ID,
          transactionId
        );
      }
      if (fatigueStatusId < 1 || fatigueStatusId > 3) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.FATIGUE_STATUS_ID_NUMBER,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateFatigueQuestion",
        this.traceFileName
      );
    }
  }

  public async validateGetFatigueStatus(commonRequest: CommonRequest) {
    this.logger.info("validateGetFatigueStatus. . . start")
    console.log("common validatior",commonRequest)
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: number = commonRequest.params.personalDataId;
    try {
      if (!commonRequest.headers?.transactionId){
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, 
          ERROR.RESOURCE.TRANSACTIONID, 
          transactionId);
      }
      console.log("personalDataId ==>",personalDataId);
      
      if (
        !personalDataId ||
        typeof Number(personalDataId) !== "number" ||
        personalDataId <= 0
      ) {
        console.log("personalDataId condition  ==>",typeof personalDataId);
        console.log("personalDataId condition  ==>", typeof Number(personalDataId));        
        console.log("personalDataId condition  ==>",personalDataId);

        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ATTENDANCE.SUBMIT_FATIGUE_QUESTION.PERSONAL_DATA_ID,
          transactionId
        );
      }
      const response: ResponseDataDto = new ResponseDataDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "validateGetFatigueStatus", this.traceFileName);
    }
  }
}
