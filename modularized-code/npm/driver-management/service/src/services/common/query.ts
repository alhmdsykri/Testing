import { STATUS_CODE } from "../../constants/CONSTANTS.json";
import { SUCCESS } from "../../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto, ResponseDataDto, CommonResponseListDto } from "astrafms-common-dto-interface";
import { CommandDao, sequelize } from "astrafms-db-mssql-driver-management";

import * as _ from "lodash";
import { isArray } from "lodash";

export class DriverCqrsService {
  private logger: any = Logger.getLogger("./services/driver.service")
  private trace: any;
  private traceFileName: any;
  private commandDao: CommandDao;

  constructor(host: string | null, username: string | null, password: string | null, databaseName: string | null,
    redisHost: string | null, redisKey: string | null) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.commandDao = new CommandDao(null, null, null, null);
    if (host) {
      sequelize.sync();
      this.commandDao = new CommandDao(host, username, password, databaseName);
    }
  }

  // -=-=-=-=-=---=- PERSONAL DATA -=-=-=-=-=-=-- //

  public async createPersonalData(commonRequest: CommonRequest) {
    this.logger.info("[SERVICE] createPersonalData...start");
    try {
      const response: ResponseDataDto = await this.commandDao.createPersonalData(commonRequest);
      return response
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createPersonalData", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- PERSONAL CONTRACT -=-=-=-=-=-=-- //

  public async createPersonalContract(commonRequest: CommonRequest) {
    this.logger.info("[SERVICE] createPersonalContract...start");
    try {
      const response: CommonResponseDto = await this.commandDao.createPersonalContract(commonRequest);
      return response
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createPersonalContract", this.traceFileName);
    }
  }

  public async updateContractStatusUsingScheduler(commonRequest: CommonRequest) {
    this.logger.info("[updateContractStatusUsingScheduler]...start");
    const query = commonRequest.query;
    const t: any = await sequelize.transaction();
    try {
      const res: any = await this.commandDao.updateContractStatusUsingScheduler(commonRequest, t);
      return res;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateContractStatusUsingScheduler", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- PERSONAL PLACEMENT -=-=-=-=-=-=-- //

  public async updatePersonal(commonRequest: CommonRequest) {
    this.logger.info("[updatePersonal]...start");
    const params = commonRequest.params;
    try {
      const res: any = await this.commandDao.updatePersonal(commonRequest);
      return res;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updatePersonal", this.traceFileName);
    }
  }

  public async updatePersonalStatusActive(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateStatusUser start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const body: any = {
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
        status: reqBody.status,
        personalDataId: reqBody.personalDataId
      };
      // const params: any = {
      //   personalDataId: reqBody.personalDataId
      // }
      commonRequest.body = body;
      const result: any = await this.commandDao.updatePersonalStatusActive(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.UPDATE_STATUS_PERSONAL;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updatePersonalStatusActive", this.traceFileName);
    }
  }

  public async updateStatusPersonalData(commonRequest: CommonRequest) {
    this.logger.info("[SERVICE] updateStatusPersonalData...start");
    try {
      const response: CommonResponseDto = await this.commandDao.updateStatusPersonalData(commonRequest);
      return response
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateStatusPersonalData", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- PERSONAL CICO POOL -=-=-=-=-=-=-- //

  public async createPersonalCicoPool(commonRequest: CommonRequest) {
    this.logger.info("[SERVICE] createPersonalCicoPool...start");
    try {
      const response: CommonResponseDto = await this.commandDao.createPersonalCicoPool(commonRequest);
      return response
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createPersonalCicoPool", this.traceFileName);
    }
  }

  public async deletePermanentPersonalCicoPool(commonRequest: CommonRequest) {
    this.logger.info("[deletePermanentPersonalCicoPool]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.commandDao.deletePermanentPersonalCicoPool(commonRequest);

      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_CICO_POOL;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "deletePermanentPersonalCicoPool", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- PERSONAL IDENTITY -=-=-=-=-=-=-- //

  public async createPersonalIdentity(commonRequest: CommonRequest) {
    this.logger.info("[SERVICE] createPersonalIdentity...start");
    try {
      const response: CommonResponseDto = await this.commandDao.createPersonalIdentity(commonRequest);
      return response
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createPersonalIdentity", this.traceFileName);
    }
  }

  public async updateIdentityStatusUsingScheduler(commonRequest: CommonRequest) {
    this.logger.info("[updateIdentityStatusUsingScheduler]...start");
    const query = commonRequest.query;
    const t: any = await sequelize.transaction();
    try {
      const res: any = await this.commandDao.updateIdentityStatusUsingScheduler(commonRequest, t);
      return res;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateIdentityStatusUsingScheduler", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- PERSONAL MCU -=-=-=-=-=-=-- //

  public async updateMcuStatusUsingScheduler(commonRequest: CommonRequest) {
    this.logger.info("updateMcuStatusUsingScheduler Service...start");
    const query = commonRequest.query;
    const t: any = await sequelize.transaction();
    try {
      const res: any = await this.commandDao.updateMcuStatusUsingScheduler(commonRequest, t);
      return res;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateMcuStatusUsingScheduler", this.traceFileName);
    }
  }
  // -=-=-=-=-=---=- PERSONAL EMPLOYMENT -=-=-=-=-=-=-- //

  public async savePersonalData(commonRequest: CommonRequest) {
    this.logger.info("[savePersonalData]...start");
    const params = commonRequest.params;
    try {
      const res: any = await this.commandDao.savePersonalData(commonRequest);
      return res;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "savePersonalData", this.traceFileName);
    }
  }

  public async savePersonalContractByPersonalContractId(commonRequest: CommonRequest) {
    this.logger.info("[service.personal][savePersonalContractByPersonalContractId]...start");
    const params = commonRequest.params;
    try {
      const res: any = await this.commandDao.savePersonalContractByPersonalContractId(commonRequest);
      return res;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "savePersonalData", this.traceFileName);
    }
  }
}
