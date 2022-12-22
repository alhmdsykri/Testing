import { applicationInsightsService, Logger, ErrorModel, ErrorWithDataModel } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto, CommonResponseListDto, ResponseDataDto } from "astrafms-common-dto-interface";
import { IRequestCreateDriver, GeneralInformationModel, ProfessionalBackgroundModel, PersonalInformationModel, DocumentsModel, CicoPoolModel, IsReadyModifyResponseDto } from "astrafms-common-dto-interface-driver-mangement";
import { STATUS_CODE } from "./constants/CONSTANTS.json";
import { SUCCESS, ERROR } from "./constants/MESSAGES.json";

export class RequestValidator {
  private logger: any = Logger.getLogger("./validator.ts");
  private trace: any;
  private traceFileName: any;

  // -=-=-=-=-=---=- COMMON -=-=-=-=-=-=-- //

  public async validateHeaders(commonRequest: CommonRequest) {
    this.logger.info("validateHeaders...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers?.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
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

  public async validatePaginationParams(commonRequest: CommonRequest) {
    this.logger.info("validatePaginationParams start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (commonRequest.query?.row) {
        if (
          typeof Number(commonRequest.query?.row) !== "number" ||
          isNaN(Number(commonRequest.query?.row))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query?.row) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
      if (commonRequest.query?.page) {
        if (
          typeof Number(commonRequest.query?.page) !== "number" ||
          isNaN(Number(commonRequest.query?.page))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query?.page) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validatePaginationParams",
        this.traceFileName
      );
    }
  }

  private async compareArrValue(arrReq: any, arrResult: any) {
    this.logger.info("compareArrValue...start");
    let filteredKeywords: any;
    filteredKeywords = arrReq.filter(
      (word: number) => !arrResult.includes(word)
    );

    const result = [];
    for (const filteredKeyword of filteredKeywords) {
      result.push(arrReq.indexOf(filteredKeyword));
    }
    return result;
  }

  // -=-=-=-=-=---=- DRIVER -=-=-=-=-=-=-- //

  public async validateGetDriverActive(commonRequest: CommonRequest) {
    this.logger.info("validateGetDriverActive start");
    const transactionId: string = commonRequest.headers.transactionId;
    const statusContract: number = Number(
      commonRequest.query?.filterUsingStatus
    );
    const businessUnitId: any = Number(commonRequest.query?.businessUnitId);
    const businessUnitCode: any = Number(commonRequest.query?.businessUnitCode);
    try {
      if (!businessUnitId && !businessUnitCode) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.LIST_ACTIVE.MISSING_BUSINESS_UNIT_ID,
          transactionId
        );
      }
      if (!statusContract) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.LIST_ACTIVE.MISSING_STATUS_CONTRACT_ID,
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
        "validateGetDriverActive",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverOverview(commonRequest: CommonRequest) {
    this.logger.info("validateGetDriverOverview start");
    const transactionId: string = commonRequest.headers.transactionId;
    const businessUnitId: any = Number(commonRequest.query?.businessUnitId);
    const businessUnitCode: any = Number(commonRequest.query?.businessUnitCode);
    try {
      if (!businessUnitId && !businessUnitCode) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.LIST_ACTIVE.MISSING_BUSINESS_UNIT_ID,
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
        "validateGetDriverOverview",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverDetail(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validategetDriverDetail start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    try {
      const validatePersonalDataId: any =
        await driverService.getUserByPersonalDataId(commonRequest);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_FOUND,
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
        "validategetDriverDetail",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverDetailByPersonalId(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverDetailByPersonalId start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalId: any = Number(commonRequest.params?.personalId);
    try {
      const validatePersonalId: any =
        await driverService.getDriverDetailByPersonalId(commonRequest);
      if (!personalId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalId.data) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_FOUND,
          transactionId
        );
      }
      if (
        !validatePersonalId.data.placementBranchId ||
        !validatePersonalId.data.placementLocationId
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_PLACEMENT,
          transactionId
        );
      const response: ResponseDataDto = new ResponseDataDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validatePersonalId.data;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateGetDriverDetailByPersonalId",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverDetailProfessionalTab(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverDetailProfessionalTab start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    try {
      const validatePersonalDataId: any =
        await driverService.getUserByPersonalDataId(commonRequest);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_FOUND,
          transactionId
        );
      }
      // if (!validatePersonalDataId.placementBranchId || !validatePersonalDataId.placementLocationId)
      //   return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.DRIVER.DETAIL.NOT_PLACEMENT, transactionId);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateGetDriverDetailProfessionalTab",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverDetailDocumentTab(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverDetailDocumentTab start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    // const company: number[] = commonRequest.headers.company;
    // const branch: number[] = commonRequest.headers.branch;
    try {
      const validatePersonalDataId: any =
        await driverService.getUserByPersonalDataId(commonRequest);
      // if (!company.includes(validatePersonalDataId.assignmentCompanyId) || !branch.includes(validatePersonalDataId.assignmentBranchId))
      //   return new ErrorModel(STATUS_CODE.CLIENT_ERROR.FORBIDDEN, ERROR.DRIVER.DETAIL.NOT_ACCESS, transactionId);
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_FOUND,
          transactionId
        );
      }
      // if (!validatePersonalDataId.placementBranchId || !validatePersonalDataId.placementLocationId)
      //   return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.DRIVER.DETAIL.NOT_PLACEMENT, transactionId);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
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
        "validateGetDriverDetailDocumentTab",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverDetailPersonal(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverDetailPersonal start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    try {
      const validatePersonalDataId: any =
        await driverService.getUserByPersonalDataId(commonRequest);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_FOUND,
          transactionId
        );
      }
      // if (!validatePersonalDataId.placementBranchId || !validatePersonalDataId.placementLocationId)
      //   return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.DRIVER.DETAIL.NOT_PLACEMENT, transactionId);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validategetDriverDetail",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverPersonalReference(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverPersonalReference. . . start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers?.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
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
        "validateGetDriverPersonalReference",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverIdentityLicense(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverIdentityLicense. . . start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers?.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
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
        "validateGetDriverIdentityLicense",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverCountryById(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverCountryById. . . start");
    const transactionId: string = commonRequest.headers.transactionId;
    const countryId: any = Number(commonRequest.params?.countryId);
    try {
      if (!commonRequest.headers?.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      const validateCountryId = await driverService.getDriverCountryById(
        commonRequest
      );
      if (!validateCountryId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.COUNTRY.MISSING_COUNTRY_BY_ID,
          transactionId
        );
      }
      const validateCountryById = await driverService.getDriverCountryById(commonRequest);
      if (!validateCountryById.data) {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.DRIVER.COUNTRY.NOT_FOUND, transactionId);
      }
      const response: ResponseDataDto = new ResponseDataDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validateCountryById.data;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateGetDriverCountryById",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverCityById(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverCityById. . . start")
    const transactionId: string = commonRequest.headers.transactionId;
    const cityId: any = Number(commonRequest.params?.cityId);
    try {
      if (!commonRequest.headers?.transactionId) {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.RESOURCE.TRANSACTIONID, transactionId);
      }
      if (!cityId) {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.DRIVER.CITY.MISSING_CITY_BY_ID, transactionId);
      }
      const validateCityById = await driverService.getDriverCityById(commonRequest);
      if (!validateCityById.data) {
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.DRIVER.CITY.NOT_FOUND, transactionId);
      }
      const response: ResponseDataDto = new ResponseDataDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validateCityById.data;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "validateGetDriverCityById", this.traceFileName);
    }
  }

  public async validateCreatePersonalPlacement(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateCreatePersonalPlacement start");
    const transactionId: string = commonRequest.headers.transactionId;
    const userId: any = Number(commonRequest.headers?.userId);
    const cicoPools: any = commonRequest.body.cicoPools;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    const {
      frontSide,
      rightSide,
      leftSide,
      branchId,
      poolId,
      customerId,
      businessUnitId,
      customerPosition,
    }: any = commonRequest.body;
    try {
      const validatePersonalDataId: any =
        await driverService.getPersonalDataById(commonRequest);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.PLACEMENT.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.PLACEMENT.NOT_FOUND,
          transactionId
        );
      }
      if (frontSide) {
        if (typeof frontSide !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PLACEMENT.MISSING_KEY_FRONTSIDE,
            transactionId
          );
      }
      if (rightSide) {
        if (typeof rightSide !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PLACEMENT.MISSING_KEY_RIGHTSIDE,
            transactionId
          );
      }
      if (leftSide) {
        if (typeof leftSide !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PLACEMENT.MISSING_KEY_LIFTSIDE,
            transactionId
          );
      }
      if (!branchId || typeof branchId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PLACEMENT.MISSING_KEY_BRANCH_ID,
          transactionId
        );
      if (!poolId || typeof poolId !== "number")
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PLACEMENT.MISSING_KEY_POOL_ID, transactionId);
      if (customerId)
        if (typeof customerId !== "number")
          return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PLACEMENT.MISSING_KEY_CUSTOMER_ID, transactionId);
      if (customerPosition)
        if (typeof customerPosition !== "string")
          return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PLACEMENT.MISSING_KEY_CUSTOMER_POSITION, transactionId);
      if (!businessUnitId || typeof businessUnitId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PLACEMENT.MISSING_KEY_BUSINESS_UNIT_ID,
          transactionId
        );
      if (!cicoPools || cicoPools.length === 0)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PLACEMENT.MISSING_KEY_CICO_POOL_ID,
          transactionId
        );
      // duplicateCicoPoolValidation
      const tempCicoPoolId: any = [];
      for (const cicoPool of cicoPools) {
        if (tempCicoPoolId.includes(cicoPool))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.DRIVER.PLACEMENT.DUPLICATING_CICO_POOL} (${cicoPool})`,
            transactionId
          );
        if (cicoPool) {
          if (typeof cicoPool !== "number") {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.DRIVER.PLACEMENT.MUST_BE_NUMBER_CICO_POOL} (${cicoPool})`,
              transactionId
            );
          }
        }
        tempCicoPoolId.push(cicoPool);
      }
      const [validateBranch, validateBu, validatePoolId, validateCicoPool] =
        await Promise.all([
          await driverService.getExternalBranchById(commonRequest),
          await driverService.getExternalBusinessUnitById(commonRequest),
          await driverService.getExternalPoolByLocationId(commonRequest),
          await driverService.getExternalCicoPoolByLocationIds(commonRequest),
        ]);

      // not found validaton
      if (
        validateBranch.code !== 200 ||
        validateBranch.data === undefined ||
        validateBranch.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.BRANCH_ID_NOT_FOUND} ${branchId}`,
          transactionId
        );
      if (
        validateBu.code !== 200 ||
        validateBu.data === undefined ||
        validateBu.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.BU_ID_NOT_FOUND} ${branchId}`,
          transactionId
        );
      if (
        validatePoolId.code !== 200 ||
        validatePoolId.code === undefined ||
        validatePoolId.data === undefined ||
        validatePoolId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.POOL_ID_NOT_FOUND} ${poolId}`,
          transactionId
        );
      if (
        validateCicoPool.code !== 200 ||
        validateCicoPool.data === undefined ||
        validateCicoPool.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.CICO_POOL_ID_NOT_FOUND} ${cicoPools}`,
          transactionId
        );
      const idCicoPool: any[] = [];
      const cicoPoolDatas: any[] = [];
      if (validateCicoPool.data.length > 0) {
        for (const cp of validateCicoPool.data) {
          idCicoPool.push(cp.locationId);
          const dataMapped = {
            personalDataId: commonRequest.params.personalDataId,
            assignmentLocationId: cp.locationId,
            assignmentLocationCode: cp.locationCode,
            assignmentLocationName: cp.locationName,
            status: 2,
            createdBy: commonRequest.headers.userId,
            createdAt: new Date().toISOString(),
            version: 1,
            photoFront: frontSide,
            photoLeft: leftSide,
            photoRight: rightSide,
          };
          cicoPoolDatas.push(dataMapped);
        }
        const indexTopicRes = await this.compareArrValue(cicoPools, idCicoPool);
        if (indexTopicRes.length > 0) {
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            ERROR.DRIVER.PLACEMENT.CICO_POOL_ID_NOT_FOUND,
            transactionId,
            indexTopicRes
          );
        }
      }
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      // data mapper
      const Datas: any[] = [];
      const personalData = {
        placementBranchId: validateBranch.data.branchId,
        placementBranchCode: validateBranch.data.branchCode,
        placementBranchName: validateBranch.data.branchName,
        placementLocationId: validatePoolId.data[0].locationId,
        placementLocationCode: validatePoolId.data[0].locationCode,
        placementLocationName: validatePoolId.data[0].locationName,
        placementBusinessUnitId: validateBu.data.businessUnitId,
        placementBusinessUnitCode: validateBu.data.businessUnitCode,
        placementBusinessUnitName: validateBu.data.businessUnitName,
        customerPosition: commonRequest.body.customerPosition,
        modifiedAt: new Date().toISOString(),
        modifiedBy: commonRequest.headers.userId,
        status: 1,
        photoFront: frontSide,
        photoLeft: leftSide,
        photoRight: rightSide,
      };
      const personalCicoLoc = {
        cicoPoolDatas,
      };
      Datas.push(personalData);
      Datas.push(personalCicoLoc);
      Datas.push({ personalDataId });
      response.data = Datas;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateCreatePersonalPlacement",
        this.traceFileName
      );
    }
  }

  public async validateCreateDriver(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateCreateDriver start");
    const transactionId: string = commonRequest.headers.transactionId;
    const {
      generalInformation,
      professionalBackground,
      personalInformation,
      documents,
    }: IRequestCreateDriver = commonRequest.body;
    const {
      photoFront,
      photoRight,
      photoLeft,
      fullName,
      personalId,
      companyId,
      personnelAreaId
    }: GeneralInformationModel = generalInformation;
    const {
      businessUnitId,
      branchId,
      poolId,
      customerId,
      customerPosition,
      picCoordinatorRoleId,
      picCoordinatorRoleName,
      picCustomerRole,
      contractTypeCode,
      contractStart,
      contractEnd,
      joinedDate,
      bankId,
      bankAccountNumber,
      bankAccountHoldername,
      phoneNumber,
      email,
      cicoPools
    }: ProfessionalBackgroundModel = professionalBackground;
    const {
      genderId,
      nationalityId,
      placeOfBirth,
      dateOfBirth,
      maritalStatusId,
      maritalDate,
      religionId,
      height,
      weight,
      bloodType,
      shoeSize,
      pantsSize,
      uniformSize,
    }: PersonalInformationModel = personalInformation;
    const tempCicoPoolId: number[] = [];
    const tempIdentityTypeId: number[] = [];
    const regexDate: RegExp = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
    const regexPhoneNumber: RegExp = /^(62)8[1-9][0-9]{6,9}$/;
    const regexEmail: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const now: Date = new Date();

    try {
      // General Information Validation
      if (!generalInformation)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.GENERAL.MISSING,
          transactionId
        );
      if (photoFront)
        if (typeof photoFront !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.GENERAL.MISSING_KEY_PHOTOFRONT,
            transactionId
          );
      if (photoRight)
        if (typeof photoRight !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.GENERAL.MISSING_KEY_PHOTORIGHT,
            transactionId
          );
      if (photoLeft)
        if (typeof photoLeft !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.GENERAL.MISSING_KEY_PHOTOLEFT,
            transactionId
          );
      if (!fullName || typeof fullName !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.GENERAL.MISSING_KEY_FULLNAME,
          transactionId
        );
      if (!personalId || typeof personalId !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.GENERAL.MISSING_KEY_PERSONAL_ID,
          transactionId
        );
      if (!companyId || typeof companyId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.GENERAL.MISSING_KEY_COMPANY_ID,
          transactionId
        );
      if (!personnelAreaId || typeof personnelAreaId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.GENERAL.MISSING_KEY_PERSONNEL_AREA_ID,
          transactionId
        );

      // Professional Background Validation
      if (!professionalBackground)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING,
          transactionId
        );
      if (!businessUnitId || typeof businessUnitId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BUSINESS_UNIT_ID,
          transactionId
        );
      if (!branchId || typeof branchId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BRANCH_ID,
          transactionId
        );
      if (!poolId || typeof poolId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_POOL_ID,
          transactionId
        );
      if (customerId)
        if (typeof customerId !== "number")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CUSTOMER_ID,
            transactionId
          );
      if (customerPosition)
        if (typeof customerPosition !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CUSTOMER_POSITION,
            transactionId
          );
      if (!contractTypeCode || typeof contractTypeCode !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CONTRACT_TYPE_CODE,
          transactionId
        );
      if (!contractStart || typeof contractStart !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CONTRACT_START,
          transactionId
        );
      if (!regexDate.test(contractStart))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_CONTRACT_START,
          transactionId
        );
      if (!contractEnd || typeof contractEnd !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CONTRACT_END,
          transactionId
        );
      if (!regexDate.test(contractEnd))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_CONTRACT_END,
          transactionId
        );
      if (contractStart && contractEnd) {
        if (new Date(contractEnd) <= new Date(contractStart))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PROFFESIONAL.INVALID_CONTRACT_END,
            transactionId
          );
      }
      if (!joinedDate || typeof joinedDate !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_JOINED_DATE,
          transactionId
        );
      if (!regexDate.test(joinedDate))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_JOINED_DATE,
          transactionId
        );
      if (!bankId || typeof bankId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BANK_ID,
          transactionId
        );
      if (!bankAccountNumber || typeof bankAccountNumber !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BANK_ACCOUNT_NUMBER,
          transactionId
        );
      if (!bankAccountHoldername || typeof bankAccountHoldername !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BANK_ACCOUNT_HOLDER_NAME,
          transactionId
        );
      if (!phoneNumber || typeof phoneNumber !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_PHONE_NUMBER,
          transactionId
        );
      if (!regexPhoneNumber.test(phoneNumber))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_PHONE_NUMBER,
          transactionId
        );
      if (email)
        if (!regexEmail.test(email) || typeof email !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_EMAIL,
            transactionId
          );
      if (!cicoPools || cicoPools.length === 0)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.GENERAL.MISSING_KEY_CICO_POOL,
          transactionId
        );
      for (const cicoPool of cicoPools) {
        if (tempCicoPoolId.includes(cicoPool))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.DRIVER.GENERAL.DUPLICATING_CICO_POOL} (${cicoPool})`,
            transactionId
          );
        if (cicoPool) {
          if (typeof cicoPool !== "number") {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.DRIVER.GENERAL.MUST_BE_NUMBER_CICO_POOL} (${cicoPool})`,
              transactionId
            );
          }
        }
        tempCicoPoolId.push(cicoPool);
      }

      // Personal Information
      if (!personalInformation)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING,
          transactionId
        );
      if (!genderId || typeof genderId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING_KEY_GENDER_ID,
          transactionId
        );
      if (!nationalityId || typeof nationalityId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING_KEY_NATIONALITY_ID,
          transactionId
        );
      if (!placeOfBirth || typeof placeOfBirth !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING_KEY_PLACE_OF_BIRTH,
          transactionId
        );
      if (!dateOfBirth || typeof dateOfBirth !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING_KEY_DATE_OF_BIRTH,
          transactionId
        );
      if (new Date(dateOfBirth) >= now)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.INVALID_DATE_OF_BIRTH,
          transactionId
        );
      if (!regexDate.test(dateOfBirth))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.REGEX_KEY_DATE_OF_BIRTH,
          transactionId
        );
      if (maritalStatusId === null || typeof maritalStatusId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING_KEY_MARITAL_STATUS_ID,
          transactionId
        );
      if (maritalDate) {
        if (typeof maritalDate !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_MARITAL_DATE,
            transactionId
          );
        if (!regexDate.test(maritalDate))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.REGEX_KEY_MARITAL_DATE,
            transactionId
          );
      }
      if (!religionId || typeof religionId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PERSONAL.MISSING_KEY_RELIGION,
          transactionId
        );
      if (height)
        if (typeof height !== "number")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_HEIGHT,
            transactionId
          );
      if (weight)
        if (typeof weight !== "number")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_WEIGHT,
            transactionId
          );
      if (bloodType)
        if (typeof bloodType !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_BLOOD_TYPE,
            transactionId
          );
      if (shoeSize)
        if (typeof shoeSize !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_SHOES_SIZE,
            transactionId
          );
      if (pantsSize)
        if (typeof pantsSize !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_PANTS_SIZE,
            transactionId
          );
      if (uniformSize)
        if (typeof uniformSize !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PERSONAL.MISSING_KEY_UNINORM_SIZE,
            transactionId
          );

      // Documents
      if (documents.length === 0)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.DOCUMENT.MISSING,
          transactionId
        );
      for (const document of documents) {
        if (tempIdentityTypeId.includes(document.identityTypeId))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.DRIVER.DOCUMENT.DUPLICATING_IDENTITY_TYPE} (${document})`,
            transactionId
          );
        if (document) {
          if (
            !document.identityTypeId ||
            typeof document.identityTypeId !== "number"
          ) {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.DRIVER.DOCUMENT.MISSING_KEY_IDENTITY_TYPE} (${document.identityTypeId})`,
              transactionId
            );
          }
          if (
            !document.identityNumber ||
            typeof document.identityNumber !== "string"
          ) {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.DRIVER.DOCUMENT.MISSING_KEY_IDENTITY_TYPE} (${document.identityNumber})`,
              transactionId
            );
          }
          if (document.expirationDate)
            if (!regexDate.test(document.expirationDate))
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.DRIVER.DOCUMENT.REGEX_KEY_EXPIRATION_DATE,
                transactionId
              );
        }
        tempIdentityTypeId.push(document.identityTypeId);
      }

      const rolePositionValidation: CommonRequest = new CommonRequest();
      rolePositionValidation.headers = commonRequest.headers;
      rolePositionValidation.body = {
        companyId,
        cicoPools,
        businessUnitId,
        branchId,
        personnelAreaId,
        poolId
      };

      const identityTypeIds: number[] = documents.map(
        (document) => document.identityTypeId
      );
      const referenceValidation: CommonRequest = new CommonRequest();
      referenceValidation.headers = commonRequest.headers;
      referenceValidation.params = {
        personalId: generalInformation?.personalId
      };
      referenceValidation.body = {
        contractTypeCode,
        bankId,
        nationalityId,
        maritalStatusId,
        religionId,
        genderId,
        identityTypeIds,
        customerId
      };

      const [
        validateDriver,
        validateCompany,
        validatePersonnelArea,
        validateBranchId,
        validateBusinessUnitId,
        validatePoolId,
        validateCicoPools,
        validateContractTypeCode,
        validateBankId,
        validateNationalityId,
        validateMaritalStatusId,
        validateReligionId,
        validateGenderId,
        validateIdentity,
        // validateCustomer
      ]: ResponseDataDto[] = await Promise.all([
        await driverService.getDriverReferenceByPersonalId(referenceValidation),
        await driverService.getExternalCompanyById(rolePositionValidation),
        await driverService.getPersonalSubAreaById(rolePositionValidation),
        await driverService.getExternalBranchById(rolePositionValidation),
        await driverService.getExternalBusinessUnitById(rolePositionValidation),
        await driverService.getExternalPoolByLocationId(rolePositionValidation),
        await driverService.getExternalCicoPoolByLocationIds(rolePositionValidation),
        await driverService.getContractTypeById(referenceValidation),
        await driverService.getBankById(referenceValidation),
        await driverService.getNationalityById(referenceValidation),
        await driverService.getMaritalStatusById(referenceValidation),
        await driverService.getReligionById(referenceValidation),
        await driverService.getGenderId(referenceValidation),
        await driverService.getIdentityTypeById(referenceValidation),
        // await driverService.getExternalCustomerById(referenceValidation)
      ]);

      const validateIdentityTypeIds: number[] = validateIdentity.data.map(
        (identity: { identityTypeId: number; identityTypeName: string }) =>
          identity.identityTypeId
      );
      const validatedIdentityIds: string = identityTypeIds
        .filter(
          (identityTypeId: number) =>
            !validateIdentityTypeIds.includes(identityTypeId)
        )
        .join(", ");

      // Role Position & Reference Validation
      if (validateDriver.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          `${ERROR.DRIVER.GENERAL.ALREADY_EXIST_PERSONAL_ID} ${personalId}`,
          transactionId
        );
      if (
        validateCompany.code !== 200 ||
        validateCompany.data === undefined ||
        validateCompany.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.COMPANY_ID_NOT_FOUND} ${companyId}`,
          transactionId
        );
      if (
        validatePersonnelArea.data === undefined || validatePersonnelArea.data === null
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.GENERAL.PERSONNEL_AREA_ID_NOT_FOUND} ${personnelAreaId}`,
          transactionId
        );
      if (
        validateBranchId.code !== 200 ||
        validateBranchId.data === undefined ||
        validateBranchId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.BRANCH_ID_NOT_FOUND} ${branchId}`,
          transactionId
        );
      if (
        validateBusinessUnitId.code !== 200 ||
        validateBusinessUnitId.data === undefined ||
        validateBusinessUnitId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.BU_ID_NOT_FOUND} ${businessUnitId}`,
          transactionId
        );
      if (
        validatePoolId.code !== 200 ||
        validatePoolId.code === undefined ||
        validatePoolId.data === undefined ||
        validatePoolId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.POOL_ID_NOT_FOUND} ${poolId}`,
          transactionId
        );
      // if (
      //   validateCustomer.code === undefined ||
      //   validateCustomer.code !== 200 ||
      //   validateCustomer.data === undefined ||
      //   validateCustomer.data === null ||
      //   validateCustomer.data.length === 0
      // )
      //   return new ErrorModel(
      //     STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
      //     `${ERROR.DRIVER.PLACEMENT.CUSTOMER_ID_NOT_FOUND}`,
      //     transactionId
      //   );
      if (
        validateCicoPools.code !== 200 ||
        validateCicoPools.data === undefined ||
        validateCicoPools.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.CICO_POOL_ID_NOT_FOUND} ${cicoPools}`,
          transactionId
        );
      if (validatedIdentityIds.length > 0)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.DOCUMENT.NOT_FOUND_IDENTITY_TYPE} ${validatedIdentityIds}`,
          transactionId
        );
      if (!validateContractTypeCode.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PROFFESIONAL.NOT_FOUND_CONTRACT_TYPE_CODE} ${contractTypeCode}`,
          transactionId
        );
      if (!validateBankId.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PROFFESIONAL.NOT_FOUND_BANK_ID} ${bankId}`,
          transactionId
        );
      if (!validateNationalityId.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PERSONAL.NOT_FOUND_NATIONALITY_ID} ${nationalityId}`,
          transactionId
        );
      if (!validateMaritalStatusId.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PERSONAL.NOT_FOUND_MARITAL_STATUS_ID} ${maritalStatusId}`,
          transactionId
        );
      if (!validateReligionId.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PERSONAL.NOT_FOUND_RELIGION_ID} ${religionId}`,
          transactionId
        );
      if (!validateGenderId.data)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PERSONAL.NOT_FOUND_GENDER_ID} ${religionId}`,
          transactionId
        );

      // Data Construction
      const tempCicoPool: CicoPoolModel[] = [];
      for (const cicoPool of validateCicoPools.data) {
        const cicoPoolIndex: CicoPoolModel = {
          cicoPoolId: cicoPool?.locationId,
          cicoPoolCode: cicoPool?.locationCode,
          cicoPoolName: cicoPool?.locationName,
        };
        tempCicoPool.push(cicoPoolIndex);
      }

      generalInformation.companyId = validateCompany.data?.companyId;
      generalInformation.companyCode = validateCompany.data?.companyCode;
      generalInformation.companyName = validateCompany.data?.companyName;
      generalInformation.personnelAreaId = validatePersonnelArea.data?.personalSubAreaId;
      generalInformation.personnelAreaCode = validatePersonnelArea.data?.personalSubAreaCode;
      generalInformation.personnelAreaName = validatePersonnelArea.data?.personalSubAreaName;
      generalInformation.cicoPool = tempCicoPool;
      professionalBackground.businessUnitId = validateBusinessUnitId.data?.businessUnitId;
      professionalBackground.businessUnitCode = validateBusinessUnitId.data?.businessUnitCode;
      professionalBackground.businessUnitName = validateBusinessUnitId.data?.businessUnitName;
      professionalBackground.branchId = validateBranchId.data?.branchId;
      professionalBackground.branchCode = validateBranchId.data?.branchCode;
      professionalBackground.branchName = validateBranchId.data?.branchName;
      professionalBackground.poolId = validatePoolId.data[0]?.locationId;
      professionalBackground.poolCode = validatePoolId.data[0]?.locationCode;
      professionalBackground.poolName = validatePoolId.data[0]?.locationName;
      // professionalBackground.customerCode = validateCustomer.data?.customerCode;
      // professionalBackground.customerName = validateCustomer.data?.customerName;
      // professionalBackground.customerId = validateCustomer.data?.customerId;

      const response: ResponseDataDto = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = {
        generalInformation,
        professionalBackground,
        personalInformation,
        documents,
      };
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateCreateDriver",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverlocation(commonRequest: CommonRequest) {
    this.logger.info("validateGetDriverActive start");
    const transactionId: string = commonRequest.headers.transactionId;
    const locationId: number = Number(commonRequest.params?.locationId);
    try {
      if (!locationId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.LOCATION.MISSING_LOCATION_ID,
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
        "validateGetDriverLocation",
        this.traceFileName
      );
    }
  }

  public async validateGetDriverTraining(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateGetDriverTraining start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    try {
      const validatePersonalDataId: any =
        await driverService.getUserByPersonalDataId(commonRequest);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.NOT_FOUND,
          transactionId
        );
      }
      // pagenation  training
      if (commonRequest.query?.rowTraining) {
        if (
          typeof Number(commonRequest.query?.rowTraining) !== "number" ||
          isNaN(Number(commonRequest.query?.rowTraining))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query?.rowTraining) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
      if (commonRequest.query?.pageTraining) {
        if (
          typeof Number(commonRequest.query?.pageTraining) !== "number" ||
          isNaN(Number(commonRequest.query?.pageTraining))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query?.pageTraining) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }

      // pagenation  skills
      if (commonRequest.query?.rowSkills) {
        if (
          typeof Number(commonRequest.query?.rowSkills) !== "number" ||
          isNaN(Number(commonRequest.query?.rowSkills))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query?.rowSkills) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
      if (commonRequest.query?.pageSkills) {
        if (
          typeof Number(commonRequest.query?.pageSkills) !== "number" ||
          isNaN(Number(commonRequest.query?.pageSkills))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query?.pageSkills) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateGetDriverTraining",
        this.traceFileName
      );
    }
  }

  public async validateUpdatePersonalPlacement(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateUpdatePersonalPlacement start");
    const transactionId: string = commonRequest.headers.transactionId;
    const userId: any = Number(commonRequest.headers?.userId);
    const cicoPools: any = commonRequest.body.cicoPools;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);

    const {
      frontSide,
      rightSide,
      leftSide,
      branchId,
      poolId,
      customerId,
      businessUnitId,
      customerPosition,
    }: any = commonRequest.body;
    try {
      const validatePersonalDataId: any =
        await driverService.getPersonalDataById(commonRequest);
      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.PLACEMENT.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.PLACEMENT.NOT_FOUND,
          transactionId
        );
      }
      // key  validation
      if (frontSide) {
        if (typeof frontSide !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PLACEMENT.MISSING_KEY_FRONTSIDE,
            transactionId
          );
      }
      if (rightSide) {
        if (typeof rightSide !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PLACEMENT.MISSING_KEY_RIGHTSIDE,
            transactionId
          );
      }
      if (leftSide) {
        if (typeof leftSide !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PLACEMENT.MISSING_KEY_LIFTSIDE,
            transactionId
          );
      }
      if (!branchId || typeof branchId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PLACEMENT.MISSING_KEY_BRANCH_ID,
          transactionId
        );
      if (!poolId || typeof poolId !== "number")
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PLACEMENT.MISSING_KEY_POOL_ID, transactionId);
      if (customerId)
        if (typeof customerId !== "number")
          return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CUSTOMER_ID, transactionId);
      if (customerPosition)
        if (typeof customerPosition !== "string")
          return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CUSTOMER_POSITION, transactionId);
      if (!businessUnitId || typeof businessUnitId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PLACEMENT.MISSING_KEY_BUSINESS_UNIT_ID,
          transactionId
        );
      if (!cicoPools || cicoPools.length === 0)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PLACEMENT.MISSING_KEY_CICO_POOL_ID,
          transactionId
        );
      // duplicateCicoPoolValidation
      const tempCicoPoolId: any = [];
      for (const cicoPool of cicoPools) {
        if (tempCicoPoolId.includes(cicoPool))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.DRIVER.PLACEMENT.DUPLICATING_CICO_POOL} (${cicoPool})`,
            transactionId
          );
        if (cicoPool) {
          if (typeof cicoPool !== "number") {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.DRIVER.PLACEMENT.MUST_BE_NUMBER_CICO_POOL} (${cicoPool})`,
              transactionId
            );
          }
        }
        tempCicoPoolId.push(cicoPool);
      }
      const [validateBranch, validateBu, validatePoolId, validateCicoPool, validateCustomer] =
        await Promise.all([
          await driverService.getExternalBranchById(commonRequest),
          await driverService.getExternalBusinessUnitById(commonRequest),
          await driverService.getExternalPoolByLocationId(commonRequest),
          await driverService.getExternalCicoPoolByLocationIds(commonRequest),
          await driverService.getExternalCustomerById(commonRequest),

        ]);

      // not found validaton
      if (
        validateBranch.code !== 200 ||
        validateBranch.data === undefined ||
        validateBranch.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.BRANCH_ID_NOT_FOUND} ${branchId}`,
          transactionId
        );
      if (
        validateBu.code !== 200 ||
        validateBu.data === undefined ||
        validateBu.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.BU_ID_NOT_FOUND} ${branchId}`,
          transactionId
        );
      if (
        validatePoolId.code !== 200 ||
        validatePoolId.code === undefined ||
        validatePoolId.data === undefined ||
        validatePoolId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.POOL_ID_NOT_FOUND} ${poolId}`,
          transactionId
        );
      if (
        validateCicoPool.code !== 200 ||
        validateCicoPool.data === undefined ||
        validateCicoPool.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.CICO_POOL_ID_NOT_FOUND} ${cicoPools}`,
          transactionId
        );

      if (
        validateCustomer.code === undefined ||
        validateCustomer.code !== 200 ||
        validateCustomer.data === undefined ||
        validateCustomer.data === null ||
        validateCustomer.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.PLACEMENT.CUSTOMER_ID_NOT_FOUND}`,
          transactionId
        );
      const idCicoPool: any[] = [];
      const cicoPoolDatas: any[] = [];
      if (validateCicoPool.data.length > 0) {
        for (const cp of validateCicoPool.data) {
          idCicoPool.push(cp.locationId);
          const dataMapped = {
            personalDataId: commonRequest.params.personalDataId,
            assignmentLocationId: cp.locationId,
            assignmentLocationCode: cp.locationCode,
            assignmentLocationName: cp.locationName,
            status: 2,
            createdBy: commonRequest.headers.userId,
            createdAt: new Date().toISOString(),
            version: 1,
            photoFront: frontSide,
            photoLeft: leftSide,
            photoRight: rightSide,
          };
          cicoPoolDatas.push(dataMapped);
        }
        const indexTopicRes = await this.compareArrValue(cicoPools, idCicoPool);
        if (indexTopicRes.length > 0) {
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            ERROR.DRIVER.PLACEMENT.CICO_POOL_ID_NOT_FOUND,
            transactionId,
            indexTopicRes
          );
        }
      }
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      // data mapper
      const Datas: any[] = [];
      const personalData = {
        placementBranchId: validateBranch.data.branchId,
        placementBranchCode: validateBranch.data.branchCode,
        placementBranchName: validateBranch.data.branchName,
        placementLocationId: validatePoolId.data[0].locationId,
        placementLocationCode: validatePoolId.data[0].locationCode,
        placementLocationName: validatePoolId.data[0].locationName,
        placementBusinessUnitId: validateBu.data.businessUnitId,
        placementBusinessUnitCode: validateBu.data.businessUnitCode,
        placementBusinessUnitName: validateBu.data.businessUnitName,
        customerPosition: commonRequest.body.customerPosition,
        modifiedAt: new Date().toISOString(),
        modifiedBy: commonRequest.headers.userId,
        status: 1,
        photoFront: frontSide,
        photoLeft: leftSide,
        photoRight: rightSide,

        customerCode: validateCustomer.data.customerCode,
        customerName: validateCustomer.data.customerName,
        customerId
      };

      const personalCicoLoc = {
        cicoPoolDatas,
      };
      Datas.push(personalData);
      Datas.push(personalCicoLoc);
      Datas.push({ personalDataId });
      response.data = Datas;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateCreatePersonalPlacement",
        this.traceFileName
      );
    }
  }

  public async validateUpdateDriverEmployment(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateUpdateDriverEmployment start");
    const transactionId: string = commonRequest.headers.transactionId;
    const userId: any = Number(commonRequest.headers?.userId);
    const cicoPools: any = commonRequest.body.cicoPools;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    const {
      personalContractId,
      contractTypeCode,
      contractStart,
      contractEnd,
      joinDate,
      bankId,
      bankAccountNumber,
      bankAccountName,
    }: any = commonRequest.body;
    const regexDate: RegExp = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
    const now: Date = new Date();

    try {
      // key  validation
      if (!personalContractId || typeof personalContractId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.EDIT_DRIVER.EMPLOYMENT.MISSING_PERSONAL_CONTRACT_ID,
          transactionId
        );
      if (!contractTypeCode || typeof contractTypeCode !== "string")
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PLACEMENT.MISSING_KEY_POOL_ID, transactionId);

      if (!contractStart || typeof contractStart !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.EDIT_DRIVER.EMPLOYMENT.MISSING_KEY_CONTRACT_START,
          transactionId
        );
      if (!contractEnd || typeof contractEnd !== "string")
        return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CUSTOMER_ID, transactionId);
      if (!contractTypeCode || typeof contractTypeCode !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CONTRACT_TYPE_CODE,
          transactionId
        );
      if (!contractStart || typeof contractStart !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CONTRACT_START,
          transactionId
        );
      if (!regexDate.test(contractStart))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_CONTRACT_START,
          transactionId
        );
      if (!contractEnd || typeof contractEnd !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_CONTRACT_END,
          transactionId
        );
      if (!regexDate.test(contractEnd))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_CONTRACT_END,
          transactionId
        );

      if (contractStart && contractEnd) {
        if (new Date(contractEnd) <= new Date(contractStart))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.PROFFESIONAL.INVALID_CONTRACT_END,
            transactionId
          );
      }
      if (!joinDate || typeof joinDate !== "string" || new Date(joinDate) > now)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_JOINED_DATE,
          transactionId
        );
      if (!regexDate.test(joinDate))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.REGEX_KEY_JOINED_DATE,
          transactionId
        );
      if (!bankId || typeof bankId !== "number")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BANK_ID,
          transactionId
        );
      if (!bankAccountNumber || typeof bankAccountNumber !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.PROFFESIONAL.MISSING_KEY_BANK_ACCOUNT_NUMBER,
          transactionId
        );
      if (!bankAccountName || typeof bankAccountName !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.EDIT_DRIVER.EMPLOYMENT.MISSING_KEY_BANK_ACCOUNT_NAME,
          transactionId
        );

      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      const [validatePersonalDataId, validateBankId, validatePersonalContractId, validateContractTypeCode] =
        await Promise.all([
          await driverService.getUserByPersonalDataId(commonRequest),
          await driverService.getBankById(commonRequest),
          await driverService.getPersonalContractById(commonRequest),
          await driverService.getContractTypeById(commonRequest),

        ]);

      // not found validation

      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.PLACEMENT.NOT_FOUND,
          transactionId
        );
      }


      if (
        validateBankId.code !== 200 ||
        validateBankId.data === null ||
        validateBankId.data === undefined ||
        validateBankId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.EDIT_DRIVER.EMPLOYMENT.MISSING_KEY_BANK_ID,
          transactionId
        );
      if (
        validatePersonalContractId.code !== 200 ||
        validatePersonalContractId.data === undefined ||
        validatePersonalContractId.data === null ||

        validatePersonalContractId.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.EDIT_DRIVER.EMPLOYMENT.MISSING_PERSONAL_CONTRACT_ID,
          transactionId
        );
      if (
        validateContractTypeCode.code !== 200 ||
        validateContractTypeCode.code === undefined ||
        validateContractTypeCode.data === undefined ||
        validateContractTypeCode.data.length === 0
      )
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.DRIVER.EDIT_DRIVER.EMPLOYMENT.MISSING_KEY_CONTRACT_TYPE_CODE}`,
          transactionId
        );
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateCreatePersonalPlacement",
        this.traceFileName
      );
    }
  }

  public async validateUpdateDriverContact(commonRequest: CommonRequest, driverService: any) {
    this.logger.info("validateUpdateDriverContact start");
    const transactionId: string = commonRequest.headers.transactionId;
    const userId: any = Number(commonRequest.headers?.userId);
    const cicoPools: any = commonRequest.body.cicoPools;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    const {
      phoneNumber,
      email,
    }: any = commonRequest.body;
    const regexEmail: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const now: Date = new Date();


    try {
      // key  validation
      if (!phoneNumber || typeof phoneNumber !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.DRIVER.EDIT_DRIVER.CONTACT.MISSING_PHONE_NUMBER,
          transactionId
        );
      if (email) {
        if (typeof email !== "string")
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.EDIT_DRIVER.CONTACT.MISSING_EMAIL,
            transactionId
          );
        if (!regexEmail.test(email))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.DRIVER.EDIT_DRIVER.CONTACT.REGEX_KEY_EMAIL,
            transactionId
          );

      }

      if (!personalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
          transactionId
        );
      }
      const validatePersonalDataId = await driverService.getUserByPersonalDataId(commonRequest)
      console.log("validatePersonalDataId==>", validatePersonalDataId);


      // not found validation

      if (!validatePersonalDataId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.DRIVER.PLACEMENT.NOT_FOUND,
          transactionId
        );
      }

      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateUpdateDriverContact",
        this.traceFileName
      );
    }
  }

  //validatePersonalIsReadyModify
  public async validatePersonalIsReadyModify(
    commonRequest: CommonRequest,
    driverService: any,
    eventHistoryService: any
  ) {
    this.logger.info("validatePersonalIsReadyModify...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const personalDataId: any = Number(commonRequest.params?.personalDataId);
    console.log("personalDataId==>", personalDataId);
    console.log("params==>", commonRequest.params);

    try {
      if (!commonRequest.headers.transactionId) {
        return new IsReadyModifyResponseDto(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          transactionId,
          false,
          ERROR.RESOURCE.TRANSACTIONID
        )
      }
      if (!personalDataId) {
        return new IsReadyModifyResponseDto(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          transactionId,
          false,
          ERROR.DRIVER.DETAIL.MISSING_PERSONAL_DATA_ID,
        );
      }
      const validatePersonalDataId = await driverService.getReadyDriverByPersonalDataId(commonRequest)
      if (!validatePersonalDataId) {
        return new IsReadyModifyResponseDto(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          transactionId,
          false,
          ERROR.DRIVER.EDIT_DRIVER.READY_MODIFY.DRIVER_NOT_FOUND,
        )
      }
      const transactionIdResult = validatePersonalDataId.transactionId

      const eventHistory = await eventHistoryService.getEventByTransactionId(transactionIdResult);
      return new IsReadyModifyResponseDto(
        eventHistory.code,
        transactionIdResult,
        eventHistory.status,
        eventHistory.message,
        eventHistory.data
      )


      // response.code = STATUS_CODE.SUCCESS.OK;
      // response.transactionId = transactionId;
      // response.message = SUCCESS.VALIDATE;
      // return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateIsReadyModifyUser",
        this.traceFileName
      );
    }
  }
}
