import { STATUS_CODE, REDIS_CACHE, PBAC, EXTERNAL_API } from "../../constants/CONSTANTS.json";
import { ERROR, SUCCESS } from "../../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto, ResponseDataDto, CommonResponseListDto } from "astrafms-common-dto-interface";
import { QueryDao, sequelize } from "astrafms-db-mssql-driver-management";
import { DotnetService } from "../../external/dotnetService";

import * as _ from "lodash";
import { isArray } from "lodash";
import { v4 as uuidv4 } from "uuid";

export class DriverService {
  private logger: any = Logger.getLogger("./services/driver.service");
  private trace: any;
  private traceFileName: any;
  private queryDao: QueryDao;
  private dotnetService: DotnetService;

  constructor(
    host: string | null,
    username: string | null,
    password: string | null,
    databaseName: string | null,
    redisHost: string | null,
    redisKey: string | null
  ) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.queryDao = new QueryDao(null, null, null, null);
    this.dotnetService = new DotnetService();
    if (host) {
      sequelize.sync();
      this.queryDao = new QueryDao(host, username, password, databaseName);
      this.dotnetService = new DotnetService();
    }
  }

  // -=-=-=-=-=---=- DRIVER -=-=-=-=-=-=-- //

  public async getActiveDrivers(commonRequest: CommonRequest) {
    this.logger.info("[getActiveDrivers]...start");
    try {
      const result: CommonResponseListDto<any> =
        await this.queryDao.getActiveDrivers(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getActiveDrivers",
        this.traceFileName
      );
    }
  }

  public async getDriverOverview(commonRequest: CommonRequest) {
    this.logger.info("[getDriverOverview]...start");
    try {
      const result: any = await this.queryDao.getDriverOverview(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverOverview",
        this.traceFileName
      );
    }
  }

  public async getDriverDetail(commonRequest: CommonRequest) {
    this.logger.info("[getDriverDetail]...start");
    try {
      const result: any = await this.queryDao.getDriverDetail(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetail",
        this.traceFileName
      );
    }
  }

  public async getDriverDetailByPersonalId(commonRequest: CommonRequest) {
    this.logger.info("[getDriverDetailByPersonalId]...start");
    try {
      const result: any = await this.queryDao.getDriverDetailByPersonalId(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailByPersonalId",
        this.traceFileName
      );
    }
  }

  public async getDriverDetailProfessionalTab(commonRequest: CommonRequest) {
    this.logger.info("[getDriverDetailProfessionalTab]...start");
    try {
      const result: any = await this.queryDao.getDriverDetailProfessionalTab(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailProfessionalTab",
        this.traceFileName
      );
    }
  }

  public async getDriverDetailDocumentTab(commonRequest: CommonRequest) {
    this.logger.info("getDriverDetailDocumentTab...start");
    try {
      const result: ResponseDataDto =
        await this.queryDao.getDriverDetailDocumentTab(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailDocumentTab",
        this.traceFileName
      );
    }
  }

  public async getUserByPersonalDataId(commonRequest: CommonRequest) {
    this.logger.info("[getUserByPersonalDataId]...start");
    try {
      const result: any = await this.queryDao.getUserByPersonalDataId(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserByPersonalDataId",
        this.traceFileName
      );
    }
  }

  public async checkDriverActive(commonRequest: CommonRequest) {
    this.logger.info("[checkDriverActive]...start");
    try {
      const result: any = await this.queryDao.getUserByPersonalDataId(commonRequest);

      const response: ResponseDataDto = {};

      if (result) {
        response.transactionId = commonRequest.headers?.transactionId;
        response.code = STATUS_CODE.SUCCESS.OK;
        response.message = "Driver active";
        response.data = result;
      } else {
        response.transactionId = commonRequest.headers?.transactionId;
        response.code = STATUS_CODE.CLIENT_ERROR.NOT_FOUND;
        response.message = "Driver nonactive";
      }

      return response;

    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "checkDriverActive",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- PERSONAL CONTRACT -=-=-=-=-=-=-- //

  public async getActiveContractDriver(commonRequest: CommonRequest) {
    this.logger.info("[getActiveContractDriver]...start");
    const query = commonRequest.query;
    try {
      const result: ResponseDataDto =
        await this.queryDao.getActiveContractDriver(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getActiveContractDriver",
        this.traceFileName
      );
    }
  }

  public async getDriverDetailPersonal(commonRequest: CommonRequest) {
    this.logger.info("[getDriverDetailPersonal]...start");
    try {
      const [identityCard, addressCard, educationCard, familyCard]: any =
        await Promise.all([
          new Promise(async (resolve, reject) => {
            try {
              const retIdentity: any = await this.queryDao.getPersonalIdentity(
                commonRequest
              );
              resolve(retIdentity);
            } catch (error) {
              reject(error);
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const retAddress: any = (await this.queryDao.getPersonalAddress(
                commonRequest
              )) as any[];
              resolve(retAddress);
            } catch (error) {
              reject(error);
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const retEducation: any =
                (await this.queryDao.getPersonalEducation(
                  commonRequest
                )) as any[];
              resolve(retEducation);
            } catch (error) {
              reject(error);
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const retFamily: any = (await this.queryDao.getPersonalFamily(
                commonRequest
              )) as any[];
              resolve(retFamily);
            } catch (error) {
              reject(error);
            }
          }),
        ]);
      return { identityCard, addressCard, educationCard, familyCard };
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailPersonal",
        this.traceFileName
      );
    }
  }

  public async getPersonalDataById(commonRequest: CommonRequest) {
    this.logger.info("[getPersonalDataById]...start");
    try {
      const result: any = await this.queryDao.getPersonalDataById(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPersonalDataById",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- PERSONAL IDENTITY -=-=-=-=-=-=-- //

  public async getAllPersonalIdentity(commonRequest: CommonRequest) {
    this.logger.info("[getAllPersonalIdentity]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.queryDao.getAllPersonalIdentity(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getAllPersonalIdentity",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- PERSONAL MCU -=-=-=-=-=-=-- //

  public async getAllPersonalMcu(commonRequest: CommonRequest) {
    this.logger.info("[getAllPersonalMcu]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.queryDao.getAllPersonalMcu(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getAllPersonalMcu",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- EXTERNAL SERVICE -=-=-=-=-=-=-- //

  public async getExternalCompanyById(commonRequest: CommonRequest) {
    this.logger.info(`getExternalCompanyById...start`);
    try {
      const result = await this.dotnetService.getExternalCompanyById(
        commonRequest
      );
      return result;
    } catch (error) {
      this.logger.error(`getExternalCompanyById Error ${error}`);
      return error;
    }
  }

  public async getExternalPersonnelAreaIdById(commonRequest: CommonRequest) {
    this.logger.info(`getExternalPersonnelAreaIdById...start`);
    try {
      const result = await this.dotnetService.getExternalPersonnelAreaIdById(
        commonRequest
      );
      return result;
    } catch (error) {
      this.logger.error(`getExternalPersonnelAreaIdById Error ${error}`);
      return error;
    }
  }

  public async getExternalBranchById(commonRequest: CommonRequest) {
    this.logger.info(`getExternalBranchById...start`);
    try {
      const result = await this.dotnetService.getExternalBranchById(
        commonRequest
      );
      return result;
    } catch (error) {
      this.logger.error(`getExternalBranchById Error ${error}`);
      return error;
    }
  }

  public async getExternalBusinessUnitById(commonRequest: CommonRequest) {
    this.logger.info(`getExternalbusinessUnitById...start`);
    try {
      const result = await this.dotnetService.getExternalBUById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getExternalBusinessUnitById Error ${error}`);
      return error;
    }
  }

  public async getExternalPoolByLocationId(commonRequest: CommonRequest) {
    this.logger.info(`getExternalPoolByLocationId...start`);
    try {
      const result = await this.dotnetService.getExternalPoolByLocationId(
        commonRequest
      );
      return result;
    } catch (error) {
      this.logger.error(`getExternalPoolByLocationId Error ${error}`);
      return error;
    }
  }

  public async getExternalCicoPoolByLocationIds(commonRequest: CommonRequest) {
    this.logger.info(`getExternalCicoPoolByLocationIds...start`);
    try {
      const cicoPools: number[] = commonRequest.body.cicoPools;
      let tempCpString: string = "";
      if (cicoPools.length > 0) {
        for (const cp of cicoPools) {
          const cpString = "&locationId=".concat(cp.toString());
          tempCpString = tempCpString.concat(cpString);
        }
      }
      const result = await this.dotnetService.getExternalCicoPoolById(
        commonRequest,
        tempCpString
      );
      return result;
    } catch (error) {
      this.logger.error(`getExternalCicoPoolByLocationIds Error ${error}`);
      return error;
    }
  }

  // -=-=-=-=-=---=- REFERENCE -=-=-=-=-=-=-- //

  public async getContractTypeById(commonRequest: CommonRequest) {
    this.logger.info(`getContractTypeById...start`);
    try {
      const result = await this.queryDao.getContractTypeById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getContractTypeById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getContractTypeById",
        this.traceFileName
      );
    }
  }

  public async getBankById(commonRequest: CommonRequest) {
    this.logger.info(`getBankById...start`);
    try {
      const result = await this.queryDao.getBankById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getBankById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getBankById",
        this.traceFileName
      );
    }
  }

  public async getNationalityById(commonRequest: CommonRequest) {
    this.logger.info(`getNationalityById...start`);
    try {
      const result = await this.queryDao.getNationalityById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getNationalityById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getNationalityById",
        this.traceFileName
      );
    }
  }

  public async getMaritalStatusById(commonRequest: CommonRequest) {
    this.logger.info(`getMaritalStatusById...start`);
    try {
      const result = await this.queryDao.getMaritalStatusById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getMaritalStatusById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getMaritalStatusById",
        this.traceFileName
      );
    }
  }

  public async getReligionById(commonRequest: CommonRequest) {
    this.logger.info(`getReligionById...start`);
    try {
      const result = await this.queryDao.getReligionById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getReligionById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getReligionById",
        this.traceFileName
      );
    }
  }

  public async getGenderId(commonRequest: CommonRequest) {
    this.logger.info(`getGenderId...start`);
    try {
      const result = await this.queryDao.getGenderId(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getGenderId Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getGenderId",
        this.traceFileName
      );
    }
  }

  public async getIdentityTypeById(commonRequest: CommonRequest) {
    this.logger.info(`getIdentityTypeById...start`);
    try {
      const result = await this.queryDao.getIdentityTypeById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getIdentityTypeById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getIdentityTypeById",
        this.traceFileName
      );
    }
  }

  public async getDriverReferenceByPersonalId(commonRequest: CommonRequest) {
    this.logger.info("[getDriverReferenceByPersonalId]...start");
    try {
      const result: any = await this.queryDao.getDriverReferenceByPersonalId(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverReferenceByPersonalId",
        this.traceFileName
      );
    }
  }

  public async getDriverPersonalReference(commonRequest: CommonRequest) {
    this.logger.info("[getDriverPersonalReference]. . .start");
    try {
      const result: any = await this.queryDao.getDriverPersonalReference(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverPersonalReference",
        this.traceFileName
      );
    }
  }

  public async getDriverIdentityLicense(commonRequest: CommonRequest) {
    this.logger.info("[getDriverIdentityLicense]. . . start");
    try {
      const result: any = await this.queryDao.getDriverIdentityLicense(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverIdentityLicense",
        this.traceFileName
      );
    }
  }

  public async getDriverAddressType(commonRequest: CommonRequest) {
    this.logger.info("getDriverAddressType. . .start");
    try {
      const result: any = await this.queryDao.getDriverAddressType(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverAddressType",
        this.traceFileName
      );
    }
  }

  public async getDriverCountry(commonRequest: CommonRequest) {
    this.logger.info("getDriverCountry. . .start");
    try {
      const result: any = await this.queryDao.getDriverCountry(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverCountry", this.traceFileName);
    }
  }

  public async getDriverCountryById(commonRequest: CommonRequest) {
    this.logger.info(`getDriverCountryById...start`);
    try {
      const result: any = await this.queryDao.getDriverCountryById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getDriverCountryById Error ${error}`);
      throw applicationInsightsService.errorModel(error, "getDriverCountryById", this.traceFileName);
    }
  }

  public async getDriverCityById(commonRequest: CommonRequest) {
    this.logger.info(`getDriverCityById...start`);
    try {
      const result: any = await this.queryDao.getDriverCityById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getDriverCityById Error ${error}`);
      throw applicationInsightsService.errorModel(error, "getDriverCityById", this.traceFileName);
    }
  }

  public async getDriverEmployeeStatus(commonRequest: CommonRequest) {
    this.logger.info("getDriverEmployeeStatus. . .start");
    try {
      const result: any = await this.queryDao.getDriverEmployeeStatus(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverEmployeeStatus", this.traceFileName);
    }
  }

  public async getAllContractType(commonRequest: CommonRequest) {
    this.logger.info("getAllContractType. . .start");
    try {
      const result: any = await this.queryDao.getAllContractType(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllContractType", this.traceFileName);
    }
  }

  public async getDriverByLocationId(commonRequest: CommonRequest) {
    this.logger.info("getDriverByLocationId. . .start");
    try {
      const result: any = await this.queryDao.getDriverByLocationId(
        commonRequest
      );
      return result;
    } catch (error) {
      this.logger.error(`getDriverLocationId Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getDriverByLocationId",
        this.traceFileName
      );
    }
  }

  public async getAllBank(commonRequest: CommonRequest) {
    this.logger.info("getAllBank . .start");
    try {
      const result: any = await this.queryDao.getAllBank(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllContractType", this.traceFileName);
    }
  }

  public async getAllFamRelationType(commonRequest: CommonRequest) {
    this.logger.info("getAllFamRelationType . .start");
    try {
      const result: any = await this.queryDao.getAllFamRelationType(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllFamRelationType", this.traceFileName);
    }
  }

  public async getDriverTraining(commonRequest: CommonRequest) {
    this.logger.info("[service].[getDriverTraining]...start");
    try {
      const [trainingCard, skillsCard]: any =
        await Promise.all([
          new Promise(async (resolve, reject) => {
            try {
              const retIdentity: any = await this.queryDao.getTrainingCard(
                commonRequest
              );
              resolve(retIdentity);
            } catch (error) {
              reject(error);
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const retAddress: any = (await this.queryDao.getSkillsCard(
                commonRequest
              )) as any[];
              resolve(retAddress);
            } catch (error) {
              reject(error);
            }
          })
        ]);
      return { trainingCard, skillsCard };
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "[service].[getDriverTraining]",
        this.traceFileName
      );
    }
  }

  public async getListPersonalSubArea(commonRequest: CommonRequest) {
    this.logger.info("getListPersonalSubArea. . .start");
    try {
      const result: any = await this.queryDao.getListPersonalSubArea(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getListPersonalSubArea", this.traceFileName);
    }
  }

  public async getPersonalSubAreaById(commonRequest: CommonRequest) {
    this.logger.info("getPersonalSubAreaById. . .start");
    try {
      const result: any = await this.queryDao.getPersonalSubAreaById(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getPersonalSubAreaById", this.traceFileName);
    }
  }

  public async getDriverCustomerPosition(commonRequest: CommonRequest) {
    this.logger.info("getDriverCustomerPosition. . .start");
    try {
      const result: any = await this.queryDao.getDriverCustomerPosition(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverCustomerPosition", this.traceFileName);
    }
  }

  public async getPersonalContractById(commonRequest: CommonRequest) {
    this.logger.info(`getPersonalContractById...start`);
    try {
      const result = await this.queryDao.getBankById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getPersonalContractById Error ${error}`);
      throw applicationInsightsService.errorModel(
        error,
        "getBankById",
        this.traceFileName
      );
    }
  }

  public async getExternalCustomerById(commonRequest: CommonRequest) {
    this.logger.info(`getExternalCustomerById...start`);
    try {
      const result = await this.dotnetService.getExternalCustomerById(commonRequest);
      return result;
    } catch (error) {
      this.logger.error(`getExternalCustomerById Error ${error}`);
      return error;
    }
  }
  public async getReadyDriverByPersonalDataId(commonRequest: CommonRequest) {
    this.logger.info("[getReadyDriverByPersonalDataId]...start");
    try {
      const result: any = await this.queryDao.getReadyDriverByPersonalDataId(
        commonRequest
      );
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getReadyDriverByPersonalDataId",
        this.traceFileName
      );
    }
  }

}
