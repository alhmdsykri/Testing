import * as stackTrace from "stack-trace";
import { CommonRequest, CommonResponseListDto, ResponseDataDto, CommonResponseDto } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../../private/database.credential";
import { sequelizer } from "../../private/initialize.database";
import { DriverDto } from "../../dto/driver.dto";
import { PersonalDataAttribute, PersonalContractAttribute } from "../../models/interfaces/index";
import { CiCoPoolDto } from "../../dto/driver.detail.dto";
import { DriverDetailDto } from "../../dto/DriverDetailDto";
import { DriverDetailProfessionalTabDto, PlacementCardDto, CustomerPICModel, EmploymentCardDto, ContactCardDto, WorkingExperienceCardDto } from "../../dto/driver.detail.professional.tab.dto";
import { DriverDetailDocumentTabDto, DocumentCardDto, MedicalCheckUpCardDto } from "../../dto/driver.detail.document.tab.dto";
import { PersonalData } from "../../models/personal.data.model";
import { PersonalContract } from "../../models/personal.contract.model";
import { PersonalCicoPool } from "../../models/personal.cico.pool.model";
import { MCUTypeResult } from "../../models/mcu.result.type.model";
import { PersonalMCU } from "../../models/personal.mcu.model";
import { Bank } from "../../models/bank.model";
import { PersonalWorkingExperience } from "../../models/personal.working.experience.model";
import { PersonalCustomerPIC } from "../../models/personal.customer.pic.model";
import { PersonalCoordinatorPIC } from "../../models/personal.coordinator.pic.model";
import { CustomerPICRole } from "../../models/customer.pic.role.model";
import { CoordinatorPICRole } from "../../models/coordinator.pic.role.model";
import { ContractType } from "../../models/contract.type.model";
import { helper } from "../../utils/helper";
import { DRIVERS, STATUS_CODE } from "../../constants/CONSTANTS.json";
import Sequelize from "sequelize";
import { QueryTypes } from "sequelize";
import { PersonalFamily } from "../../models/personal.family";
import { Gender } from "../../models/gender.model";
import { RelationType } from "../../models/relation.type.model";
import { AddressType } from "../../models/address.type.model";
import { Province } from "../../models/province.model";
import { City } from "../../models/city.model";
import { PersonalAddress } from "../../models/personal.address";
import { Religion } from "../../models/religion.model";
import { Nationality } from "../../models/nationality.model";
import { MaritalStatus } from "../../models/marital.status.model";
import { IdentityType } from "../../models/identity.type.model";
import { PersonalIdentity } from "../../models/personal.identity.model";
import { PersonalEducation } from "../../models/personal.education.model";
import { EmployeeStatus } from "../../models/employee.status.model";
import { CustomerPosition } from "../../models/customer.position.model";
import { PersonalAddressDto, PersonalEducationsDto, PersonalFamiliesDto, PersonalIdentityDto } from "../../dto/personal.tab.dto";
import { EducationType } from "../../models/education.type.model";
import { PersonalSubArea } from "../../models/personal.sub.area.model";
import { PersonalSubAreaAttribute } from "../../models/interfaces/personal.sub.area.model.interface";
import { sequelize } from "../../private/database";
import { Country } from "../../models/country.model";
import { stringifyConfiguration } from "tslint/lib/configuration";
import { DriverTrainingto } from "../../dto/driver.training.dto";
import { DriverSkillsDto } from "../../dto/driver.training.dto";
import { PersonalAbility } from "../../models/personal.ability.model";
import { Ability } from "../../models/ability.model";
import { AbilityType } from "../../models/ability.type.model";

const Op = Sequelize.Op;

export class QueryDao {
  private logger: any = Logger.getLogger("./dao/mssql/driver.dao");
  private trace: any;
  private traceFileName: any;

  constructor(
    host: string | null,
    username: string | null,
    password: string | null,
    databaseName: string | null
  ) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    DatabaseCredential.set(host, username, password, databaseName);
    if (host) {
      sequelizer.sync();
    }
  }

  // -=-=-=-=-=---=- DRIVER -=-=-=-=-=-=-- //

  public async getActiveDrivers(commonRequest: CommonRequest) {
    this.logger.info("[DAO getActiveDrivers]...start");
    try {
      const query: any = commonRequest.query;
      const headers: any = commonRequest.headers;
      const orderBy: string = query.orderBy ? query.orderBy : "asc";
      const row: number = !isNaN(query.row) ? query.row < 1 ? DRIVERS.DEFAULT.ROW : query.row : DRIVERS.DEFAULT.ROW;
      const page: number = !isNaN(query.page) ? query.page >= 1 ? Number(query.page) - 1 : query.page : 0;
      // const company: any = headers.company.join(", ");
      // const branch: any = headers.branch.join(", ");

      // FIXED WHERE CLAUSE = 2
      // let whereClause: string = `WHERE
      //           (PC.status = 2)
      //       AND
      //           (PD.status = 2)
      //       AND
      //           (PC.contractStatus != 0)
      //       AND
      //           (
      //               PD.placementBusinessUnitId ${!query.businessUnitId ? `IS NULL` : `= ` + query.businessUnitId}
      //           OR
      //               PD.placementBusinessUnitCode ${!query.businessUnitCode ? `IS NULL` : `= ` + `'${query.businessUnitCode}'`}
      //           )
      //       AND
      //       (
      //           PD.assignmentCompanyId ${headers.company.length <= 0 ? `IS NULL` : `IN (${company})`}
      //           OR
      //           PD.assignmentBranchId ${headers.branch.length <= 0 ? `IS NULL` : `IN (${branch})`}
      //       )
      //       `;
      let whereClause: string = `WHERE
        (PC.status = ${DRIVERS.STATUS.ACTIVE})
        AND
            (PD.status = ${DRIVERS.STATUS.ACTIVE})
        AND
            (PC.contractStatus != ${DRIVERS.CONTRACT_STATUS.EXPIRED})
        AND
            (
                PD.placementBusinessUnitId ${!query.businessUnitId ? `IS NULL` : `= ` + query.businessUnitId}
            OR
                PD.placementBusinessUnitCode ${!query.businessUnitCode ? `IS NULL` : `= ` + `'${query.businessUnitCode}'`}
            )
        `;

      let order: string = `ORDER BY PD.modifiedAt desc`;
      let whereClauseFilter: string = "";
      let whereClauseSearch: string = "";

      // FILTER CONTRACT STATUS
      if (Number(query.filterUsingStatus) === DRIVERS.OVERVIEW_CONTRACT_STATUS.ACTIVE) {
        whereClauseFilter =
          whereClauseFilter +
          `
            AND
              (PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.ACTIVE})
            AND
              (
                  PD.placementBranchId IS NOT null
                OR
                  PD.placementBranchCode IS NOT null
                OR
                  PD.placementLocationName IS NOT null
                OR
                  PD.placementLocationCode IS NOT null
              )
          `;
      } else if (Number(query.filterUsingStatus) === DRIVERS.OVERVIEW_CONTRACT_STATUS.WILL_BE_EXPIRED) {
        whereClauseFilter =
          whereClauseFilter +
          `
            AND
              (PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON})
            AND
              (
                  PD.placementBranchId IS NOT null
                OR
                  PD.placementBranchCode IS NOT null
                OR
                  PD.placementLocationName IS NOT null
                OR
                  PD.placementLocationCode IS NOT null
              )
          `;
      } else if (Number(query.filterUsingStatus) === DRIVERS.OVERVIEW_CONTRACT_STATUS.PENDING_PLACEMENT
      ) {
        whereClauseFilter =
          whereClauseFilter +
          `
            AND
              (
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.ACTIVE}
                OR
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}
              )
            AND
              (
                  PD.placementBranchId IS null
                OR
                  PD.placementBranchCode IS null
                OR
                  PD.placementLocationName IS null
                OR
                  PD.placementLocationCode IS null
              )
          `;
      } else if (Number(query.filterUsingStatus) === DRIVERS.OVERVIEW_CONTRACT_STATUS.ALL
      ) {
        whereClauseFilter =
          whereClauseFilter +
          `
            AND
              (
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.ACTIVE}
                OR
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}
              )
          `;
      }

      // SEARCH
      if (query.searchUsingPersonalId) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.personalCode LIKE '%${query.searchUsingPersonalId}%'
          `;
      }
      if (query.searchUsingNRP) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.nrp LIKE '%${query.searchUsingNRP}%'
          `;
      }
      if (query.searchUsingFullname) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.fullName LIKE '%${query.searchUsingFullname}%'
          `;
      }
      if (query.searchUsingpersonnelAreaCode) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.assignmentBranchCode LIKE '%${query.searchUsingpersonnelAreaCode}%'
          `;
      }
      if (query.searchUsingpersonnelAreaName) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.assignmentBranchName LIKE '%${query.searchUsingpersonnelAreaName}%'
          `;
      }
      if (query.searchUsingBranchCode) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.placementBranchCode LIKE '%${query.searchUsingBranchCode}%'
          `;
      }
      if (query.searchUsingBranchName) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.placementBranchName LIKE '%${query.searchUsingBranchName}%'
          `;
      }
      if (query.searchUsingCustomerCode) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.customerCode LIKE '%${query.searchUsingCustomerCode}%'
          `;
      }
      if (query.searchUsingCustomerName) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            PD.customerName LIKE '%${query.searchUsingcustomerName}%'
          `;
      }
      if (query.searchUsingContractType) {
        whereClauseSearch =
          whereClauseSearch +
          `AND
            CTT.contractTypeDescription LIKE '%${query.searchUsingContractType}%'
          `;
      }

      whereClause = whereClause + whereClauseFilter + whereClauseSearch;

      // SORTING SECTION
      if (query.sortBy && query.sortBy === "pool") {
        order = `ORDER BY PD.placementLocationCode ${orderBy}, PD.placementLocationName ${orderBy}, PD.modifiedAt desc`;
      }

      // PAGINATION
      const pData = helper.getPagination(page, row, DRIVERS.DEFAULT.ROW);
      const pagination: string = ` OFFSET ${pData.offset} ROWS FETCH NEXT ${pData.limit} ROWS ONLY`;

      const queryRaw: string = `SELECT PC.[personalDataId],
                        PD.[personalCode] AS [personalId],
                        PD.[nrp], PD.[fullName],
                        PD.[placementBranchCode],
                        PD.[placementBranchName],
                        PD.[assignmentBranchCode], PD.[assignmentBranchName],
                        PD.[placementLocationCode], PD.[placementLocationName],
                        PD.[customerName], PD.[customerCode],
                        PD.[modifiedAt] AS [lastUpdate],
                        CTT.contractTypeDescription AS contractType,
                        CT.expiresOn, PC.[contractStatus]
                    FROM
                        [dbo].[PersonalContract] AS PC
                        INNER JOIN
                        (
                            SELECT [PersonalContract].[personalDataId], MIN ([PersonalContract].[contractStart]) as [contractStart], MIN (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                            FROM [dbo].[PersonalContract] AS [PersonalContract] INNER JOIN [dbo].[ContractType] AS
                            [ContractType] ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                            WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON} AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE}))
                            GROUP BY [PersonalContract].[personalDataId]
                        ) AS CT
                    ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                        INNER JOIN
                        [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                        INNER JOIN
                        [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                        ${whereClause} ${order} ${pagination}`;

      const queryRawTotal: string = `SELECT COUNT(DISTINCT(PC.[personalDataId])) as total
                 FROM
                     [dbo].[PersonalContract] AS PC
                     INNER JOIN
                     (
                     SELECT [PersonalContract].[personalDataId], MIN ([PersonalContract].[contractStart]) as [contractStart], MIN (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                     FROM [dbo].[PersonalContract] AS [PersonalContract] INNER JOIN [dbo].[ContractType] AS
                     [ContractType] ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                     WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}) AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE})
                     GROUP BY [PersonalContract].[personalDataId]
                     ) AS CT
                 ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                     INNER JOIN
                     [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                     INNER JOIN
                     [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                     ${whereClause}`;

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryPersonalData] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            const retCount: any = await sequelize.query(queryRawTotal, {
              type: QueryTypes.SELECT,
              logging: console.log,
            });
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const retPersonalData: any = await sequelize.query(queryRaw, {
              type: QueryTypes.SELECT,
              logging: console.log,
            });
            resolve(retPersonalData);
          } catch (error) {
            reject(error);
          }
        }),
      ]);

      const resCount: any = queryCount;
      const resPersonalData: any = queryPersonalData;

      const resDriverList: DriverDto[] = [];
      let contractStatus: string = "";

      resPersonalData.forEach((driver: any) => {
        !driver.assignmentBranchCode ? (driver.assignmentBranchCode = null) : (driver.assignmentBranchCode = driver.assignmentBranchCode);
        !driver.assignmentBranchName ? (driver.assignmentBranchName = null) : (driver.assignmentBranchName = driver.assignmentBranchName);
        !driver.placementLocationCode ? (driver.placementLocationCode = null) : (driver.placementLocationCode = driver.placementLocationCode);
        !driver.placementLocationName ? (driver.placementLocationName = null) : (driver.placementLocationName = driver.placementLocationName);
        !driver.placementBranchCode ? (driver.placementBranchCode = null) : (driver.placementBranchCode = driver.placementBranchCode);
        !driver.placementBranchName ? (driver.placementBranchName = null) : (driver.placementBranchName = driver.placementBranchName);
        !driver.customerCode ? (driver.customerCode = null) : (driver.customerCode = driver.customerCode);
        !driver.customerName ? (driver.customerName = null) : (driver.customerName = driver.customerName);
        if (driver.placementBranchCode && driver.placementBranchName && driver.placementLocationName && driver.placementLocationCode) {
          if (driver.contractStatus === DRIVERS.CONTRACT_STATUS.ACTIVE) {
            contractStatus = "Active";
          } else if (driver.contractStatus === DRIVERS.CONTRACT_STATUS.EXPIRY_ON) {
            if (driver.expiresOn > 1)
              contractStatus = `Expiring in ${driver.expiresOn} days`;
            else
              contractStatus = `Expiring in ${driver.expiresOn} day`;
          }
        } else {
          contractStatus = "Pending Placement";
        }
        const tempDriver: DriverDto = {
          personalDataId: driver.personalDataId,
          personalId: driver.personalId,
          nrp: driver.nrp,
          fullName: driver.fullName,
          personnelAreaCode: driver.assignmentBranchCode,
          personnelAreaName: driver.assignmentBranchName,
          branchCode: driver.placementBranchCode,
          branchName: driver.placementBranchName,
          poolCode: driver.placementLocationCode,
          poolName: driver.placementLocationName,
          customerCode: driver.customerCode,
          customerName: driver.customerName,
          contractType: driver.contractType,
          statusContract: contractStatus,
          lastUpdate: driver.lastUpdate,
        };
        resDriverList.push(tempDriver);
      });

      const drivers: any = resDriverList as any[];
      const totalDataCount: number = resCount[0].total;
      const response: CommonResponseListDto<any> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: number | null = page + 2 > maxPage ? null : page + 2;
      response.page = page + 1;
      response.nextPage = nextPage;
      response.row = Number(row);
      response.total = totalDataCount;
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get active drivers";
      response.data = drivers;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getActiveDrivers",
        this.traceFileName
      );
    }
  }

  public async getDriverOverview(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverOverview]...start");
    try {
      const query: any = commonRequest.query;
      const headers: any = commonRequest.headers;

      // FIXED WHERE CLAUSE = 2
      const whereClause: string = `WHERE
            (PC.status = 2)
          AND
            (PD.status = 2)
          AND
            (
                PD.placementBusinessUnitId ${!query.businessUnitId ? `IS NULL` : `= ` + query.businessUnitId}
            OR
                PD.placementBusinessUnitCode ${!query.businessUnitCode ? `IS NULL` : `= ` + `'${query.businessUnitCode}'`}
            )
        `;

      let whereClauseFilterActive: string = "";
      let whereClauseFilterExpiryOn: string = "";
      let whereClauseFilterPendingPlacement: string = "";
      let whereClauseFilterTotal: string = "";

      whereClauseFilterActive =
        whereClause +
        `
            AND
              (PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.ACTIVE})
            AND
              (
                  PD.placementBranchId IS NOT null
                OR
                  PD.placementBranchCode IS NOT null
                OR
                  PD.placementLocationName IS NOT null
                OR
                  PD.placementLocationCode IS NOT null
              )
          `;
      whereClauseFilterExpiryOn =
        whereClause +
        `
            AND
              (PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON})
            AND
              (
                  PD.placementBranchId IS NOT null
                OR
                  PD.placementBranchCode IS NOT null
                OR
                  PD.placementLocationName IS NOT null
                OR
                  PD.placementLocationCode IS NOT null
              )
          `;
      whereClauseFilterPendingPlacement =
        whereClause +
        `
            AND
              (
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.ACTIVE}
                OR
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}
              )
            AND
              (
                  PD.placementBranchId IS null
                OR
                  PD.placementBranchCode IS null
                OR
                  PD.placementLocationName IS null
                OR
                  PD.placementLocationCode IS null
              )
          `;
      whereClauseFilterTotal =
        whereClause +
        `
            AND
              (
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.ACTIVE}
                OR
                  PC.contractStatus = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}
              )
          `;

      const queryCountActiveRaw: string = `SELECT COUNT(PC.[personalDataId]) as total
                 FROM
                     [dbo].[PersonalContract] AS PC
                     INNER JOIN
                     (
                     SELECT [PersonalContract].[personalDataId], MIN ([PersonalContract].[contractStart]) as [contractStart], MIN (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                     FROM [dbo].[PersonalContract] AS [PersonalContract] INNER JOIN [dbo].[ContractType] AS
                     [ContractType] ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                     WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}) AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE})
                     GROUP BY [PersonalContract].[personalDataId]
                     ) AS CT
                 ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                     INNER JOIN
                     [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                     INNER JOIN
                     [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                     ${whereClauseFilterActive}`;

      const queryCountExpiryOnRaw: string = `SELECT COUNT(PC.[personalDataId]) as total
                 FROM
                     [dbo].[PersonalContract] AS PC
                     INNER JOIN
                     (
                     SELECT [PersonalContract].[personalDataId], MIN ([PersonalContract].[contractStart]) as [contractStart], MIN (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                     FROM [dbo].[PersonalContract] AS [PersonalContract] INNER JOIN [dbo].[ContractType] AS
                     [ContractType] ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                     WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}) AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE})
                     GROUP BY [PersonalContract].[personalDataId]
                     ) AS CT
                 ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                     INNER JOIN
                     [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                     INNER JOIN
                     [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                     ${whereClauseFilterExpiryOn}`;

      const queryCountPendingPlacementRaw: string = `SELECT COUNT(PC.[personalDataId]) as total
                 FROM
                     [dbo].[PersonalContract] AS PC
                     INNER JOIN
                     (
                     SELECT [PersonalContract].[personalDataId], MIN ([PersonalContract].[contractStart]) as [contractStart], MIN (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                     FROM [dbo].[PersonalContract] AS [PersonalContract] INNER JOIN [dbo].[ContractType] AS
                     [ContractType] ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                     WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}) AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE})
                     GROUP BY [PersonalContract].[personalDataId]
                     ) AS CT
                 ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                     INNER JOIN
                     [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                     INNER JOIN
                     [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                     ${whereClauseFilterPendingPlacement}`;

      const queryCountTotalRaw: string = `SELECT COUNT(PC.[personalDataId]) as total
                 FROM
                     [dbo].[PersonalContract] AS PC
                     INNER JOIN
                     (
                     SELECT [PersonalContract].[personalDataId], MIN ([PersonalContract].[contractStart]) as [contractStart], MIN (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                     FROM [dbo].[PersonalContract] AS [PersonalContract] INNER JOIN [dbo].[ContractType] AS
                     [ContractType] ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                     WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON}) AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE})
                     GROUP BY [PersonalContract].[personalDataId]
                     ) AS CT
                 ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                     INNER JOIN
                     [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                     INNER JOIN
                     [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                     ${whereClauseFilterTotal}`;

      // ORM SEQUELIZE QUERY PROCEDURE
      const [
        queryCountActive,
        queryCountExpiryOn,
        queryCountPendingPlacement,
        queryCountTotal,
      ]: any = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            const retCount: any = await sequelize.query(queryCountActiveRaw, {
              type: QueryTypes.SELECT,
            });
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const retCount: any = await sequelize.query(queryCountExpiryOnRaw, {
              type: QueryTypes.SELECT,
            });
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const retCount: any = await sequelize.query(
              queryCountPendingPlacementRaw,
              {
                type: QueryTypes.SELECT,
              }
            );
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const retCount: any = await sequelize.query(queryCountTotalRaw, {
              type: QueryTypes.SELECT,
            });
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
      ]);

      const result: any = {
        total: queryCountTotal[0].total,
        active: queryCountActive[0].total,
        upcomingExpiry: queryCountExpiryOn[0].total,
        pendingPlacement: queryCountPendingPlacement[0].total,
      };

      const driverOverview: any = result as any[];
      const response: CommonResponseListDto<any> = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver overview";
      response.data = driverOverview;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverOverview",
        this.traceFileName
      );
    }
  }

  public async getDriverDetail(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverDetail]...start");
    try {
      let personalDataId: number = Number(
        commonRequest.params?.personalDataId || null
      );
      isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

      const option: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "personalCode",
          "nrp",
          "fullName",
          "assignmentBranchId",
          "assignmentBranchCode",
          "assignmentBranchName",
          "assignmentCompanyId",
          "assignmentCompanyCode",
          "assignmentCompanyName",
        ],
        where: {
          personalDataId,
          status: DRIVERS.STATUS.ACTIVE,
        },
        include: [
          {
            model: PersonalCicoPool,
            attributes: ["assignmentLocationId", "assignmentLocationCode", "assignmentLocationName"],
            left: true,
            paranoid: false,
          },
          {
            model: PersonalContract,
            attributes: [],
            required: true,
            where: {
              personalDataId,
              status: DRIVERS.STATUS.ACTIVE,
              contractStatus: {
                [Op.ne]: DRIVERS.CONTRACT_STATUS.EXPIRED,
              },
            },
            include: [
              {
                model: ContractType,
                attributes: ["isInternal"],
              },
            ],
          },
        ],
      };

      const resQuery: any = await PersonalData.findAll(option);

      let resCicoPool: any = [];

      resQuery.forEach((pool: any) => {
        if (pool["PersonalCicoPools.assignmentLocationCode"] && pool["PersonalCicoPools.assignmentLocationName"]) {
          const cicoPool: CiCoPoolDto = {
            cicoPoolId: pool["PersonalCicoPools.assignmentLocationId"],
            cicoPoolCode: pool["PersonalCicoPools.assignmentLocationCode"],
            cicoPoolName: pool["PersonalCicoPools.assignmentLocationName"],
          };
          resCicoPool.push(cicoPool);
        } else {
          resCicoPool = [];
        }
      });
      const resDriverDetail: DriverDetailDto = {
        personalDataId: resQuery[0].personalDataId,
        personalId: resQuery[0].personalCode,
        nrp: resQuery[0].nrp,
        fullName: resQuery[0].fullName,
        personnelAreaId: resQuery[0].assignmentBranchId,
        personnelAreaCode: resQuery[0].assignmentBranchCode,
        personnelAreaName: resQuery[0].assignmentBranchName,
        companyId: resQuery[0].assignmentCompanyId,
        companyCode: resQuery[0].assignmentCompanyCode,
        companyName: resQuery[0].assignmentCompanyName,
        cicoPool: resCicoPool,
        isInternal: resQuery[0]["PersonalContracts.ContractType.isInternal"],
      };

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver detail";
      response.data = resDriverDetail;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetail",
        this.traceFileName
      );
    }
  }

  public async getDriverDetailByPersonalId(commonRequest: CommonRequest) {
    this.logger.info("dao getDriverDetailByPersonalId...start");
    try {
      const personalId: string = String(
        commonRequest.params?.personalId || null
      );

      // const company: number[] = headers.company;
      // const branch: number[] = headers.branch;
      const whereClause: {} = {
        personalCode: personalId,
        status: DRIVERS.STATUS.ACTIVE,
        // assignmentCompanyId: {
        //   [Op.in]: company,
        // },
        // assignmentBranchId: {
        //   [Op.in]: branch,
        // },
      };

      const whereClausePersonalContract: {} = {
        status: DRIVERS.STATUS.ACTIVE,
        [Op.or]: [
          {
            contractStatus: DRIVERS.CONTRACT_STATUS.EXPIRY_ON,
          },
          {
            contractStatus: DRIVERS.CONTRACT_STATUS.ACTIVE,
          },
        ],
      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "nrp",
          ["personalCode", "personalId"],
          "placementBranchId",
          "placementLocationId",
        ],
        where: whereClause,
        include: [
          {
            model: PersonalContract,
            attributes: [],
            required: true,
            paranoid: false,
            where: whereClausePersonalContract,
          },
        ],
      };

      const driver: any = await PersonalData.findOne(filter);

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver detail by personalId";
      response.data = driver;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailByPersonalId",
        this.traceFileName
      );
    }
  }

  public async getUserByPersonalDataId(commonRequest: CommonRequest) {
    this.logger.info("dao getUserByPersonalDataId...start");
    try {
      let personalDataId: number = Number(
        commonRequest.params?.personalDataId || null
      );
      isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

      // const company: number[] = headers.company;
      // const branch: number[] = headers.branch;
      const whereClause: {} = {
        personalDataId,
        status: DRIVERS.STATUS.ACTIVE,
        employeeStatusId: DRIVERS.EMPLOYEE_STATUS.ACTIVE
        // assignmentCompanyId: {
        //   [Op.in]: company,
        // },
        // assignmentBranchId: {
        //   [Op.in]: branch,
        // },
      };

      const whereClausePersonalContract: {} = {
        status: DRIVERS.STATUS.ACTIVE,
        [Op.or]: [
          {
            contractStatus: DRIVERS.CONTRACT_STATUS.EXPIRY_ON,
          },
          {
            contractStatus: DRIVERS.CONTRACT_STATUS.ACTIVE,
          },
        ],
      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "placementBranchId",
          "placementLocationId",
          "assignmentBranchId",
          "assignmentCompanyId",
        ],
        where: whereClause,
        include: [
          {
            model: PersonalContract,
            attributes: ["personalDataId", "contractStatus"],
            required: true,
            paranoid: false,
            where: whereClausePersonalContract,
            order: [
              ["personalDataId", "asc"],
              ["contractStart", "desc"],
              ["contractEnd", "desc"],
            ],
          },
        ],
      };

      const user: any = await PersonalData.findOne(filter);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserByPersonalDataId",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- DRIVER DETAIL -=-=-=-=-=-=-- //

  public async getDriverDetailProfessionalTab(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverDetailProfessionalTab]...start");
    try {
      let personalDataId: number = Number(
        commonRequest.params?.personalDataId || null
      );

      const whereClausePersonalContract: any = {};

      isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

      whereClausePersonalContract[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
          [Op.or]: [
            {
              contractStatus: DRIVERS.CONTRACT_STATUS.EXPIRY_ON,
            },
            {
              contractStatus: DRIVERS.CONTRACT_STATUS.ACTIVE,
            },
          ],
        },
      ];

      const option: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "placementBusinessUnitId",
          "placementBusinessUnitCode",
          "placementBusinessUnitName",
          "placementBranchId",
          "placementBranchCode",
          "placementBranchName",
          "placementLocationId",
          "placementLocationCode",
          "placementLocationName",
          "customerCode",
          "customerName",
          "customerPosition",
          "joinDate",
          "bankAccountNumber",
          "bankAccountName",
          "handphone",
          "email",
        ],
        where: {
          personalDataId,
          status: DRIVERS.STATUS.ACTIVE,
        },
        include: [
          {
            model: PersonalContract,
            attributes: [
              "personalDataId",
              "contractStart",
              "contractEnd",
              [
                Sequelize.fn(
                  "DATEDIFF",
                  Sequelize.col("day"),
                  Sequelize.fn("GETDATE"),
                  Sequelize.col("contractEnd")
                ),
                "expiresOn",
              ],
              "contractStatus",
            ],
            include: [
              {
                model: ContractType,
                attributes: [
                  ["contractTypeDescription", "contractType"],
                  "isInternal",
                ],
                required: true,
                paranoid: false,
              },
            ],
            required: true,
            paranoid: false,
            where: whereClausePersonalContract,
            order: [
              ["personalDataId", "asc"],
              ["contractStart", "desc"],
              ["contractEnd", "desc"],
            ],
          },
          {
            model: Bank,
            attributes: ["bankName"],
            required: true,
            paranoid: false,
          },
          {
            model: PersonalWorkingExperience,
            attributes: [
              "personalWorkingExperienceId",
              "companyName",
              "workingStart",
              "workingEnd",
              "vehicleTypeCode",
              "vehicleTypeName",
              "isDriverExperience",
            ],
            left: true,
            paranoid: false,
          },
        ],
      };

      const resQuery: any = await PersonalData.findAll(option);

      if (resQuery[resQuery.length - 1].placementBranchCode &&
        resQuery[resQuery.length - 1].placementBranchName &&
        resQuery[resQuery.length - 1].placementLocationName &&
        resQuery[resQuery.length - 1].placementLocationCode
      ) {
        if (resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"] === DRIVERS.CONTRACT_STATUS.ACTIVE) {
          resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"] = "Active";
        } else if (resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"] === DRIVERS.CONTRACT_STATUS.EXPIRY_ON) {
          if (resQuery[resQuery.length - 1]["PersonalContracts.expiresOn"] > 1)
            resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"] = `Expiring in ${resQuery[resQuery.length - 1]["PersonalContracts.expiresOn"]} days`;
          else
            resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"] = `Expiring in ${resQuery[resQuery.length - 1]["PersonalContracts.expiresOn"]} day`;
        }
      } else {
        resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"] = "Pending Placement";
      }

      const employmentCard: EmploymentCardDto = {
        contractType: resQuery[resQuery.length - 1]["PersonalContracts.ContractType.contractType"],
        contractStart: resQuery[resQuery.length - 1]["PersonalContracts.contractStart"],
        contractEnd: resQuery[resQuery.length - 1]["PersonalContracts.contractEnd"],
        contractStatus: resQuery[resQuery.length - 1]["PersonalContracts.contractStatus"],
        joinDate: resQuery[resQuery.length - 1].joinDate,
        bankName: resQuery[resQuery.length - 1]["Bank.bankName"],
        bankAccountNumber: resQuery[resQuery.length - 1].bankAccountNumber,
        bankAccountName: resQuery[resQuery.length - 1].bankAccountName,
        isInternal: resQuery[resQuery.length - 1]["PersonalContracts.ContractType.isInternal"],
      };

      const contactCard: ContactCardDto = {
        phoneNumber: resQuery[resQuery.length - 1].handphone,
        email: resQuery[resQuery.length - 1].email,
      };

      const placementCard: PlacementCardDto = {
        businessUnitId: resQuery[resQuery.length - 1].placementBusinessUnitId,
        businessUnitCode: resQuery[resQuery.length - 1].placementBusinessUnitCode,
        businessUnitName: resQuery[resQuery.length - 1].placementBusinessUnitName,
        branchId: resQuery[resQuery.length - 1].placementBranchId,
        branchCode: resQuery[resQuery.length - 1].placementBranchCode,
        branchName: resQuery[resQuery.length - 1].placementBranchName,
        poolId: resQuery[resQuery.length - 1].placementLocationId,
        poolCode: resQuery[resQuery.length - 1].placementLocationCode,
        poolName: resQuery[resQuery.length - 1].placementLocationName,
        customerCode: resQuery[resQuery.length - 1].customerCode,
        customerName: resQuery[resQuery.length - 1].customerName,
      };

      const workingExperienceCard: WorkingExperienceCardDto[] = [];
      const tempPersonalWorkingExperienceId: any[] = [];
      let tempPosition: string;

      resQuery.forEach((driver: any) => {
        if (driver["PersonalWorkingExperiences.personalWorkingExperienceId"]) {
          if (tempPersonalWorkingExperienceId.includes(
            driver["PersonalWorkingExperiences.personalWorkingExperienceId"]
          )
          ) {
            return true;
          } else {
            driver["PersonalWorkingExperiences.isDriverExperience"] ? (tempPosition = `Driver`) : (tempPosition = "Non Driver");
            const tempWorkingExperienceCard: WorkingExperienceCardDto = {
              company: driver["PersonalWorkingExperiences.companyName"],
              position: tempPosition,
              unitTypeCode: driver["PersonalWorkingExperiences.vehicleTypeName"],
              unitType: driver["PersonalWorkingExperiences.vehicleTypeCode"],
              startDate: driver["PersonalWorkingExperiences.workingStart"],
              startEnd: driver["PersonalWorkingExperiences.workingEnd"],
            };
            workingExperienceCard.push(tempWorkingExperienceCard);
          }
          tempPersonalWorkingExperienceId.push(
            driver["PersonalWorkingExperiences.personalWorkingExperienceId"]
          );
        }
      });

      const driverDetailProfessionalTab: DriverDetailProfessionalTabDto = {
        personalDataId: resQuery[resQuery.length - 1].personalDataId,
        placementCard,
        employmentCard,
        contactCard,
        workingExperienceCard,
      };

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver detail professional tab";
      response.data = driverDetailProfessionalTab;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailProfessionalTab",
        this.traceFileName
      );
    }
  }

  public async getDriverDetailDocumentTab(commonRequest: CommonRequest) {
    this.logger.info("DAO getDriverDetailDocumentTab...start");
    try {
      let personalDataId: number = Number(
        commonRequest.params?.personalDataId || null
      );
      isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

      const resQueryIdentity: any = await PersonalIdentity.findAll({
        logging: console.log,
        raw: true,
        where: {
          personalDataId,
          status: DRIVERS.STATUS.ACTIVE,
        },
        attributes: [
          "personalIdentityId",
          "identityAccountNumber",
          "identityAccountName",
          "identityValidTo",
          "identityStatus",
          [
            Sequelize.fn(
              "DATEDIFF",
              Sequelize.col("day"),
              Sequelize.fn("GETDATE"),
              Sequelize.col("identityValidTo")
            ),
            "expiresOn",
          ],
        ],
        include: [
          {
            model: IdentityType,
            attributes: ["identityTypeId", "identityTypeName"],
            required: true,
            paranoid: false,
          },
        ],
      });

      const resQueryMcu: any = await PersonalMCU.findAll({
        logging: console.log,
        raw: true,
        where: {
          personalDataId,
          status: DRIVERS.STATUS.ACTIVE,
        },
        attributes: [
          "personalMCUId",
          "healthFacility",
          "mcuDate",
          "mcuExpirationDate",
          "mcuStatus",
          [
            Sequelize.fn(
              "DATEDIFF",
              Sequelize.col("day"),
              Sequelize.fn("GETDATE"),
              Sequelize.col("mcuExpirationDate")
            ),
            "expiresOn",
          ],
        ],
        include: [
          {
            model: MCUTypeResult,
            attributes: ["mcuTypeResultId", "mcuTypeResultDetail"],
            required: true,
            paranoid: false,
          },
        ],
      });

      const documentCard: DocumentCardDto[] = [];
      const medicalCheckUpCard: MedicalCheckUpCardDto[] = [];

      resQueryIdentity.forEach((identity: any) => {
        const tempDocumentCard: DocumentCardDto = {
          personalIdentityId: identity.personalIdentityId,
          identityTypeId: identity["IdentityType.identityTypeId"],
          identityTypeName: identity["IdentityType.identityTypeName"],
          identityAccountNumber: identity.identityAccountNumber,
          identityExpirationDate: identity.identityValidTo,
          attachment: null,
          statusId: identity.identityStatus
        };
        if (identity.identityStatus === DRIVERS.IDENTITY.ACTIVE) {
          tempDocumentCard.status = "Active";
        } else if (identity.identityStatus === DRIVERS.IDENTITY.EXPIRY_ON) {
          if (identity.expiresOn > 1)
            tempDocumentCard.status = `Expiring in ${identity.expiresOn} days`;
          else
            tempDocumentCard.status = `Expiring in ${identity.expiresOn} day`;
        } else if (identity.identityStatus === DRIVERS.IDENTITY.EXPIRED) {
          tempDocumentCard.status = `Expired`;
        }
        documentCard.push(tempDocumentCard);
      });

      resQueryMcu.forEach((mcu: any) => {
        const tempMedicalCheckUp: MedicalCheckUpCardDto = {
          personalMCUId: mcu.personalMCUId,
          mcuTypeResultId: mcu["MCUTypeResult.mcuTypeResultId"],
          mcuTypeResultDetail: mcu["MCUTypeResult.mcuTypeResultDetail"],
          healthFacility: mcu.healthFacility,
          mcuDate: mcu.mcuDate,
          mcuExpirationDate: mcu.mcuExpirationDate,
          attachment: null,
          statusId: mcu.mcuStatus
        };
        if (mcu.mcuStatus === DRIVERS.MCU.ACTIVE) {
          tempMedicalCheckUp.status = "Active";
        } else if (mcu.mcuStatus === DRIVERS.MCU.EXPIRY_ON) {
          if (mcu.expiresOn > 1)
            tempMedicalCheckUp.status = `Expiring in ${mcu.expiresOn} days`;
          else tempMedicalCheckUp.status = `Expiring in ${mcu.expiresOn} day`;
        } else if (mcu.mcuStatus === DRIVERS.MCU.EXPIRED) {
          tempMedicalCheckUp.status = `Expired`;
        }
        medicalCheckUpCard.push(tempMedicalCheckUp);
      });

      const documentTab: DriverDetailDocumentTabDto = {
        documentCard,
        medicalCheckUpCard,
      };

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver detail document tab";
      response.data = documentTab;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverDetailDocumentTab",
        this.traceFileName
      );
    }
  }

  public async getPersonalIdentity(commonRequest: CommonRequest) {
    this.logger.info("[DAO getPersonalIdentity]...start");
    try {
      const personalDataIdParam: any = commonRequest.params.personalDataId;
      const whereClause: any = {};
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      if (personalDataIdParam) {
        whereClause[Op.and].push({ personalDataId: personalDataIdParam });
      }

      const retIdentity: any = await PersonalData.findOne({
        logging: console.log,
        raw: true,
        subQuery: false,
        attributes: [
          ["[birthPlace]", "placeOfBirth"],
          ["[birthDate]", "dateOfBirth"],
          ["[birthDate]", "dateOfBirth"],
          "height",
          "weight",
          "bloodType",
          "shoesSize",
          "pantsSize",
          "uniformSize",
        ],
        where: whereClause,
        include: [
          {
            model: Gender,
            attributes: [["genderDescription", "gender"], "genderId"],
            required: false,
            paranoid: false,
          },
          {
            model: MaritalStatus,
            attributes: [
              ["maritalStatusDescription", "maritalStatus"],
              "maritalStatusId",
            ],
            required: false,
            paranoid: false,
          },
          {
            model: Nationality,
            attributes: [["nationalityName", "nationality"], "nationalityId"],
            required: false,
            paranoid: false,
          },
          {
            model: Religion,
            attributes: [["religionName", "religion"], "religionId"],
            required: false,
            paranoid: false,
          },
        ],
      });

      const identityData: any = retIdentity as PersonalIdentityDto[];
      let dataIdn: PersonalIdentityDto = {};
      dataIdn = {
        height: identityData.height,
        dateOfBirth: identityData.dateOfBirth,
        pantsSize: identityData.pantsSize,
        bloodType: identityData.bloodType,
        religion: identityData["Religion.religion"],
        religionId: identityData["Religion.religionId"],
        nationality: identityData["Nationality.nationality"],
        nationalityId: identityData["Nationality.nationalityId"],
        gender: identityData["Gender.gender"],
        genderId: identityData["Gender.genderId"],
        placeOfBirth: identityData.placeOfBirth,
        weight: identityData.weight,
        shoeSize: identityData.shoesSize,
        uniformSize: identityData.uniformSize,
        maritalStatus: identityData["MaritalStatus.maritalStatus"],
        maritalStatusId: identityData["MaritalStatus.maritalStatusId"],
      };
      // for (const idn of identityData) {
      //   dataIdn = {
      //     height: idn["PersonalDatum.height"],
      //     dateOfBirth: idn["PersonalDatum.dateOfBirth"],
      //     pantsSize: idn["PersonalDatum.pantsSize"],
      //     bloodtype: idn["PersonalDatum.bloodType"],
      //     religion: idn["PersonalDatum.Religion.religion"],
      //     religionId: idn["PersonalDatum.Religion.religionId"],
      //     nationality: idn["PersonalDatum.Nationality.nationality"],
      //     nationalityId: idn["PersonalDatum.Nationality.nationalityId"],
      //     gender: idn["PersonalDatum.Gender.gender"],
      //     genderId: idn["PersonalDatum.Gender.genderId"],
      //     placeOfBirth: idn["PersonalDatum.placeOfBirth"],
      //     weight: idn["PersonalDatum.weight"],
      //     shoeSize: idn["PersonalDatum.shoesSize"],
      //     uniformSize: idn["PersonalDatum.uniformSize"],
      //   };
      //   // identityDatas.push(dataIdn);
      // }
      return dataIdn;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPersonalIdentity",
        this.traceFileName
      );
    }
  }

  public async getPersonalAddress(commonRequest: CommonRequest) {
    this.logger.info("[DAO getPersonalAddress]...start");
    try {
      const personalDataIdParam: any = commonRequest.params.personalDataId;
      const whereClause: any = {};
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      if (personalDataIdParam) {
        whereClause[Op.and].push({ personalDataId: personalDataIdParam });
      }

      const retAddress: any = await PersonalAddress.findAll({
        logging: console.log,
        raw: true,
        subQuery: false,
        attributes: [
          "addressDetail",
          "phoneNumber",
          "postalCode",
          "contactName",
        ],
        where: whereClause,
        include: [
          {
            model: City,
            attributes: [["[cityName]", "city"]],
            include: [
              {
                model: Province,
                attributes: [["provinceName", "province"]],
                include: [
                  {
                    model: Nationality,
                    attributes: [
                      ["nationalityName", "nationality"],
                      "nationalityId",
                    ],
                    required: false,
                    paranoid: false,
                  },
                ],
                required: false,
                paranoid: false,
              },
            ],
            required: false,
            paranoid: false,
          },
          {
            model: AddressType,
            attributes: [["addressTypeName", "addressType"]],
            required: false,
            paranoid: false,
          },
        ],
      });
      const data: PersonalAddressDto = {};
      const adressDataData: any = retAddress as PersonalAddressDto[];
      const addressDatas: any[] = [];
      for (const adr of adressDataData) {
        data.addressType = adr["AddressType.addressType"];
        data.addressDetail = adr.addressDetail;
        data.postalCode = adr.postalCode;
        data.city = adr["City.city"];
        data.province = adr["City.Province.province"];
        data.country = adr["City.Province.Nationality.nationality"];
        data.contactName = adr.contactName;
        data.phoneNumber = adr.phoneNumber;
        addressDatas.push(data);
      }
      return addressDatas;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPersonalAddress",
        this.traceFileName
      );
    }
  }

  public async getPersonalEducation(commonRequest: CommonRequest) {
    this.logger.info("[DAO getPersonalEducation]...start");
    try {
      const personalDataIdParam: any = commonRequest.params.personalDataId;
      const whereClause: any = {};
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      if (personalDataIdParam) {
        whereClause[Op.and].push({ personalDataId: personalDataIdParam });
      }

      const retEducation: any = await PersonalEducation.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: [["institute", "schoolName"], "startDate", "endDate"],
        where: whereClause,
        include: [
          {
            model: EducationType,
            attributes: [["educationName", "educationLevel"]],
            include: [],
            required: false,
            paranoid: false,
          },
        ],
      });

      const educationData: any = retEducation as PersonalEducationsDto[];
      const eduDatas: any[] = [];
      const data: PersonalEducationsDto = {};
      for (const edu of educationData) {
        const dataEdu: PersonalEducationsDto = {
          educationlevel: edu["EducationType.educationLevel"],
          schoolName: edu.schoolName,
          startDate: edu.startDate,
          endDate: edu.endDate,
        };
        eduDatas.push(dataEdu);
      }
      return eduDatas;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPersonalEducation",
        this.traceFileName
      );
    }
  }

  public async getPersonalFamily(commonRequest: CommonRequest) {
    this.logger.info("[DAO getPersonalFamily]...start");
    try {
      const personalDataIdParam: any = commonRequest.params.personalDataId;
      const query: any = commonRequest.query;
      const whereClause: any = {};
      const row: number = !isNaN(query.row)
        ? query.row < 1 ? DRIVERS.DEFAULT.ROW : query.row
        : DRIVERS.DEFAULT.ROW_FAMILY;
      const page: number = !isNaN(query.page)
        ? query.page >= 1 ? Number(query.page) - 1 : query.page
        : 0;
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      if (personalDataIdParam) {
        whereClause[Op.and].push({ personalDataId: personalDataIdParam });
      }

      // Pagination
      const pData = helper.getPagination(page, row, DRIVERS.DEFAULT.ROW_FAMILY);
      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryFamily] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL APPROVALS
            const retEducations: any = (await PersonalFamily.findAll({
              logging: console.log,
              raw: true,
              subQuery: false,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[PersonalFamily].[PersonalFamilyId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
              include: [
                {
                  model: Gender,
                  attributes: [],
                  required: false,
                  paranoid: false,
                },
                {
                  model: RelationType,
                  attributes: [],
                  required: false,
                  paranoid: false,
                },
              ],
            })) as PersonalFamiliesDto[];
            resolve(retEducations);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL EDUCATIONS
            const retEducations: any = (await PersonalFamily.findAll({
              logging: console.log,
              subQuery: false,
              attributes: [
                ["FullName", "name"],
                "[placeOfBirth]",
                "dateOfBirth",
                ["[identityNumber]", "nik"],
                "profession",
              ],
              where: whereClause,
              include: [
                {
                  model: Gender,
                  attributes: [["genderDescription", "gender"], "genderId"],
                  required: false,
                  paranoid: false,
                },
                {
                  model: RelationType,
                  attributes: [["relationTypeName", "relation"]],
                  required: false,
                  paranoid: false,
                },
              ],
              raw: true,
              nest: true,
              limit: pData.limit,
              offset: pData.offset,
            })) as PersonalFamiliesDto[];
            resolve(retEducations);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];

      const families: any = queryFamily as PersonalFamiliesDto[];
      const familyDatas: any[] = [];
      let index: number = 0;
      for (const family of families) {
        const data: PersonalFamiliesDto = {
          name: family.name,
          gender: family.Gender.gender,
          genderId: family.Gender.genderId,
          relation: family.RelationType.relation,
          profession: family.profession,
          placeofBirth: family.placeOfBirth,
          dateOfBirth: family.dateOfBirth,
          nik: family.nik,
        };
        familyDatas.push(data);
        index = index = 1;
      }
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const familyResponse: CommonResponseListDto<PersonalFamiliesDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: number | null = page + 2 > maxPage ? null : page + 2;
      familyResponse.page = page + 1;
      familyResponse.nextPage = nextPage;
      familyResponse.row = Number(row);
      familyResponse.total = totalDataCount;
      familyResponse.data = familyDatas;

      return familyResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPersonalFamily",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- DRIVER CONTRACT -=-=-=-=-=-=-- //

  public async getActiveContractDriver(commonRequest: CommonRequest) {
    this.logger.info("[DAO getActiveContractDriver]...start");
    try {
      const queryRaw: string = `SELECT  DISTINCT(PC.personalDataId),
                                PC.personalContractId,
                                CT.contractStart,
                                PC.contractEnd,
                                PC.contractStatus,
                                CTT.isInternal,
                                (DATEDIFF([day], GETDATE(), [contractEnd])) AS [expiresOn]
                                    FROM
                                    [dbo].[PersonalContract] AS PC
                                    INNER JOIN
                                    (
                                        SELECT [PersonalContract].[personalDataId],
                                      MIN ([PersonalContract].[contractStart]) as [contractStart]
                                        FROM [dbo].[PersonalContract] AS [PersonalContract]
                                    INNER JOIN [dbo].[ContractType] AS [ContractType]
                                  ON [PersonalContract].[contractTypeCode] = [ContractType].[contractTypeCode]
                                        WHERE (([PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.ACTIVE} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.EXPIRY_ON} OR [PersonalContract].[contractStatus] = ${DRIVERS.CONTRACT_STATUS.NOT_STARTED}) AND [PersonalContract].[status] = ${DRIVERS.STATUS.ACTIVE})
                                        GROUP BY [PersonalContract].[personalDataId]) AS CT
                                    ON PC.[personalDataId] = CT.[personalDataId] AND PC.[contractStart] = CT.[contractStart]
                                    INNER JOIN
                                    [dbo].[PersonalData] AS PD ON PD.[personalDataId] = PC.personalDataId
                                    INNER JOIN
                                    [dbo].[ContractType] AS CTT ON CTT.[contractTypeCode] = PC.[contractTypeCode]
                                WHERE PC.[contractStatus] != 0
                                ORDER BY PC.personalDataId ASC, contractStart DESC, contractEnd ASC`;

      const result: any = await sequelize.query(queryRaw, { type: QueryTypes.SELECT });

      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get active contract drivers";
      response.data = result;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getActiveContractDriver",
        this.traceFileName
      );
    }
  }

  public async getPersonalDataById(commonRequest: CommonRequest) {
    this.logger.info("dao getPersonalDataById...start");
    try {
      let personalDataId: number = Number(
        commonRequest.params?.personalDataId || null
      );
      isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

      const whereClause: {} = {
        personalDataId,
        status: DRIVERS.STATUS.ACTIVE,
      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "placementBranchId",
          "placementLocationId",
        ],
        where: whereClause,
      };

      const response: any = await PersonalData.findOne(filter);
      return response;
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
    this.logger.info("[DAO getAllPersonalIdentity]...start");
    try {
      const whereClause: any = {};

      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      const personalIdentity: any = await PersonalIdentity.findAll({
        logging: console.log,
        raw: true,
        subQuery: false,
        attributes: [
          "personalIdentityId",
          "personalDataId",
          "identityValidTo",
          "identityStatus",
        ],
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get all personal identity";
      response.data = personalIdentity;

      return response;
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
    this.logger.info("[DAO getAllPersonalMcu]...start");
    try {
      const whereClause: any = {};

      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      const personalMcu: any = await PersonalMCU.findAll({
        logging: console.log,
        raw: true,
        subQuery: false,
        attributes: [
          "personalMCUId",
          "personalDataId",
          "mcuExpirationDate",
          "mcuStatus",
        ],
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get all personal mcu";
      response.data = personalMcu;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getAllPersonalIdentity",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- REFERENCE -=-=-=-=-=-=-- //

  public async getContractTypeById(commonRequest: CommonRequest) {
    this.logger.info("DAO getContractTypeById...start");
    try {
      const contractTypeCode: string = commonRequest.body.contractTypeCode;
      const whereClause: any = {
        contractTypeCode,
      };

      const contractType: any = await ContractType.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get contract type by type code";
      response.data = contractType;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getContractTypeById",
        this.traceFileName
      );
    }
  }

  public async getBankById(commonRequest: CommonRequest) {
    this.logger.info("DAO getBankById...start");
    try {
      const bankId: number = commonRequest.body.bankId;
      const whereClause: any = {
        bankId,
      };

      const bank: any = await Bank.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get bank by id";
      response.data = bank;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getBankById",
        this.traceFileName
      );
    }
  }

  public async getNationalityById(commonRequest: CommonRequest) {
    this.logger.info("DAO getNationalityById...start");
    try {
      const nationalityId: number = commonRequest.body.nationalityId;
      const whereClause: any = {
        nationalityId,
      };

      const nationality: any = await Nationality.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get nationality by id";
      response.data = nationality;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getNationalityById",
        this.traceFileName
      );
    }
  }

  public async getMaritalStatusById(commonRequest: CommonRequest) {
    this.logger.info("DAO getMaritalStatusById...start");
    try {
      const maritalStatusId: number = commonRequest.body.maritalStatusId;
      const whereClause: any = {
        maritalStatusId,
      };

      const maritalStatus: any = await MaritalStatus.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get marital status by id";
      response.data = maritalStatus;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getMaritalStatusById",
        this.traceFileName
      );
    }
  }

  public async getReligionById(commonRequest: CommonRequest) {
    this.logger.info("DAO getReligionById...start");
    try {
      const religionId: number = commonRequest.body.religionId;
      const whereClause: any = {
        religionId,
      };

      const religion: any = await Religion.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get religion by id";
      response.data = religion;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getReligionById",
        this.traceFileName
      );
    }
  }

  public async getGenderId(commonRequest: CommonRequest) {
    this.logger.info("DAO getGenderId...start");
    try {
      const genderId: number = commonRequest.body.genderId;
      const whereClause: any = {
        genderId,
      };

      const gender: any = await Gender.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get gender by id";
      response.data = gender;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getGenderId",
        this.traceFileName
      );
    }
  }

  public async getIdentityTypeById(commonRequest: CommonRequest) {
    this.logger.info("DAO getIdentityTypeById...start");
    try {
      const identityTypeIds: number[] = commonRequest.body.identityTypeIds;
      const whereClause: any = {
        identityTypeId: {
          [Op.in]: identityTypeIds,
        },
      };

      const identityType: any = await IdentityType.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: whereClause,
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get identity type by id";
      response.data = identityType;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getIdentityTypeById",
        this.traceFileName
      );
    }
  }

  public async getDriverReferenceByPersonalId(commonRequest: CommonRequest) {
    this.logger.info("dao getDriverReferenceByPersonalId...start");
    try {
      const personalId: string = String(
        commonRequest.params?.personalId || null
      );

      const whereClause: {} = {
        personalCode: personalId,
        status: 2
      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "nrp",
          ["personalCode", "personalId"],
          "placementBranchId",
          "placementLocationId",
        ],
        where: whereClause,
      };

      const driver: any = await PersonalData.findOne(filter);

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver detail by personalId";
      response.data = driver;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverReferenceByPersonalId",
        this.traceFileName
      );
    }
  }

  public async getDriverPersonalReference(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverPersonalReference]. . .start");
    try {
      const maritalStatus: any = await MaritalStatus.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["maritalStatusId", "maritalStatusDescription"],
      });

      const nationality: any = await Nationality.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["nationalityId", "nationalityName"],
      });

      const religion: any = await Religion.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["religionId", "religionName"],
      });

      const driverReferencePersonal: any = {
        maritalStatus,
        nationalities: nationality,
        religions: religion,
      };

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get driver data personal references!";
      response.data = driverReferencePersonal;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverPersonalReference",
        this.traceFileName
      );
    }
  }

  public async getDriverIdentityLicense(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverIdentityLicense]. . .start");
    try {
      const identityLicense: any = await IdentityType.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["identityTypeId", "identityTypeName"],
      });

      // const driverIdentityLicense: any = {
      //   identityLicense
      // }

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of data driver's license!";
      response.data = identityLicense;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverIdentityLicense",
        this.traceFileName
      );
    }
  }

  public async getDriverAddressType(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverAddressType]. . .start");
    try {
      const addressType: any = await AddressType.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["addressTypeCode", "addressTypeName"],
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver's address type!";
      response.data = addressType;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverAddressType",
        this.traceFileName
      );
    }
  }

  public async getDriverCountry(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverCountry]. . .start");
    try {
      const driverCountry: any = await Country.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["countryId", "countryName"],
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver's country!";
      response.data = driverCountry;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverCountry",
        this.traceFileName
      );
    }
  }

  public async getDriverCountryById(commonRequest: CommonRequest) {
    this.logger.info("DAO getDriverCountryById...start");
    try {
      let countryId: number = Number(
        commonRequest.params?.countryId || null
      );
      isNaN(countryId)
        ? (countryId = 0)
        : (countryId = countryId);

      const whereClause: {} = {
        countryId,
      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "countryId",
          "countryName"
        ],
        where: whereClause,
      };

      const country: any = await Country.findOne(filter);

      const response: ResponseDataDto = new ResponseDataDto();
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get data of driver's country by id!";
      response.data = country;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverCountryById", this.traceFileName);
    }
  }

  public async getDriverCityById(commonRequest: CommonRequest) {
    this.logger.info("DAO getDriverCityById...start");
    try {
      let cityId: number = Number(
        commonRequest.params?.cityId || null
      );
      isNaN(cityId)
        ? (cityId = 0)
        : (cityId = cityId);

      const whereClause: {} = {
        cityId
      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "cityId",
          "cityName"
        ],
        where: whereClause,
      };

      const city: any = await City.findOne(filter);

      const response: ResponseDataDto = new ResponseDataDto();
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get data of driver's city by id!";
      response.data = city;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverCityById", this.traceFileName);
    }
  }

  public async getDriverEmployeeStatus(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverEmployeeStatus]. . .start");
    try {
      const driverEmployeeStatus: any = await EmployeeStatus.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["employeeStatusId", "employeeStatusDescription"],
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver's employee status!";
      response.data = driverEmployeeStatus;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverEmployeeStatus", this.traceFileName
      );
    }
  }

  public async getAllContractType(commonRequest: CommonRequest) {
    this.logger.info("[DAO getAllContractType]. . .start");
    try {
      const driverContractType: any = await ContractType.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["contractTypeCode", "contractTypeDescription", "isInternal"]
      })

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver's Contract Type!";
      response.data = driverContractType;

      return response;

    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllContractType", this.traceFileName);
    }
  }

  public async getAllBank(commonRequest: CommonRequest) {
    this.logger.info("[DAO getAllBank]. . .start");
    try {
      const driverContractType: any = await Bank.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["bankId", "bankName"]
      })

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver's Bank!";
      response.data = driverContractType;

      return response;

    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllContractType", this.traceFileName);
    }
  }

  public async getDriverByLocationId(commonRequest: CommonRequest) {
    this.logger.info("DAO getDriverByLocationId...start");
    try {
      const locationId: number = commonRequest.params.locationId;
      let personalDataId: boolean = false;
      const whereClausePersonalData: any = {
        placementLocationId: locationId,
        status: DRIVERS.STATUS.ACTIVE,
      };

      const whereClausePersonalCico: any = {
        assignmentLocationId: locationId,
        status: DRIVERS.STATUS.ACTIVE,
      };

      const locationPersonalData: any = await PersonalData.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["personalDataId"],
        where: whereClausePersonalData
      });

      if (locationPersonalData.length > 0) {
        personalDataId = true
      }

      const locationPersonalCicoLoc: any = await PersonalCicoPool.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["personalDataId"],
        where: whereClausePersonalCico,
      });

      if (locationPersonalCicoLoc.length > 0) {
        personalDataId = true
      }

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get driver by locationId";
      response.data = { "isValid": personalDataId }

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDriverByLocationId",
        this.traceFileName
      );
    }
  }

  public async getAllFamRelationType(commonRequest: CommonRequest) {
    this.logger.info("[DAO getAllFamRelationType]. . .start");
    try {
      const driverContractType: any = await RelationType.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["relationTypeCode", "relationTypeName"]
      })

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list Relation Type Family of driver";
      response.data = driverContractType;

      return response;

    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllContractType", this.traceFileName);
    }
  }

  public async getTrainingCard(commonRequest: CommonRequest) {
    this.logger.info("[DAO getTrainingCard]...start");
    try {
      const personalDataIdParam: any = commonRequest.params.personalDataId;
      const query: any = commonRequest.query;
      const whereClause: any = {};
      const rowTraining: number = !isNaN(query.rowTraining) ? query.rowTraining < 1 ? DRIVERS.DEFAULT.ROW_TRAINING : query.rowTraining : DRIVERS.DEFAULT.ROW_TRAINING;
      const pageTraining: number = !isNaN(query.pageTraining) ? query.pageTraining >= 1 ? Number(query.pageTraining) - 1 : query.pageTraining : 0;

      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      if (personalDataIdParam) {
        whereClause[Op.and].push({ personalDataId: personalDataIdParam });
      }

      // Pagination
      const pData = helper.getPagination(pageTraining, rowTraining, DRIVERS.DEFAULT.ROW);
      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryTraining] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL APPROVALS
            const retEducations: any = (await PersonalEducation.findAll({
              logging: console.log,
              raw: true,
              subQuery: false,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[PersonalEducation].[personalEducationId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
              include: [
                {
                  model: EducationType,
                  attributes: [],
                  where: {
                    status: DRIVERS.STATUS.ACTIVE

                  },
                  required: false,
                  paranoid: false,
                },

              ],
            })) as DriverTrainingto[];
            resolve(retEducations);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL EDUCATIONS
            const retEducations: any = (await PersonalEducation.findAll({
              logging: console.log,
              subQuery: false,
              attributes: [
                "personalEducationId",
                "[branchOfStudy]",
                [
                  Sequelize.literal(
                    "CASE WHEN [certificateExpirationDate] < DATEADD(HOUR , 7, GETDATE()) THEN 0 WHEN (DATEDIFF([day], DATEADD(HOUR , 7, GETDATE()), [certificateExpirationDate])) <= 30 THEN 1 ELSE 2 END",
                  ),
                  "expirationStatus"
                ],
                "certificateExpirationDate"
              ],
              where: whereClause,
              include: [
                {
                  model: EducationType,
                  attributes: ["educationName"],
                  required: false,
                  paranoid: false,
                }
              ],
              raw: true,
              nest: true,
              limit: pData.limit,
              offset: pData.offset,
            })) as DriverTrainingto[];
            resolve(retEducations);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];

      const trainings: any = queryTraining as DriverTrainingto[];
      const trainingDatas: any[] = [];
      for (const training of trainings) {
        const data: DriverTrainingto = {
          personalEducationId: training.personalEducationId,
          educationName: training.EducationType.educationName,
          branchOfStudy: training.branchOfStudy,
          expirationStatus: training.expirationStatus,
          certificateExpirationDate: training.certificateExpirationDate

        };
        trainingDatas.push(data);
      }
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const trainingResponse: CommonResponseListDto<DriverTrainingto> = {};
      const maxPage: number = Math.ceil(totalDataCount / rowTraining);
      const nextPage: number | null = pageTraining + 2 > maxPage ? null : pageTraining + 2;
      trainingResponse.page = pageTraining + 1;
      trainingResponse.nextPage = nextPage;
      trainingResponse.row = Number(rowTraining);
      trainingResponse.total = totalDataCount;
      trainingResponse.data = trainingDatas;

      return trainingResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getTrainingCard",
        this.traceFileName
      );
    }
  }

  public async getSkillsCard(commonRequest: CommonRequest) {
    this.logger.info("[DAO getSkillCard]...start");
    try {
      const personalDataIdParam: any = commonRequest.params.personalDataId;
      const query: any = commonRequest.query;
      const whereClause: any = {};
      const rowSkills: number = !isNaN(query.rowSkills) ? query.rowSkills < 1 ? DRIVERS.DEFAULT.ROW_TRAINING : query.rowSkills : DRIVERS.DEFAULT.ROW_TRAINING;
      const pageSkills: number = !isNaN(query.pageSkills) ? query.pageSkills >= 1 ? Number(query.pageSkills) - 1 : query.pageSkills
        : 0;
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: DRIVERS.STATUS.ACTIVE,
        },
      ];
      if (personalDataIdParam) {
        whereClause[Op.and].push({ personalDataId: personalDataIdParam });
      }

      // Pagination
      const pData = helper.getPagination(pageSkills, rowSkills, DRIVERS.DEFAULT.ROW_TRAINING);
      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, querySkills] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL TOTAL SKILLS
            const retSkills: any = (await PersonalAbility.findAll({
              logging: console.log,
              raw: true,
              subQuery: false,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[PersonalAbility].[personalAbilityId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
              include: [
                {
                  model: Ability,
                  attributes: [],
                  required: true,
                  paranoid: false,
                  include: [
                    {
                      model: AbilityType,
                      attributes: [],
                      required: true,
                      paranoid: false,
                    },
                  ]
                }
              ],
            })) as DriverSkillsDto[];
            resolve(retSkills);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL SKILLS
            const retSkills: any = (await PersonalAbility.findAll({
              logging: console.log,
              subQuery: false,
              attributes: [
                "[personalAbilityId]",
                "[score]",
              ],
              where: whereClause,
              include: [
                {
                  model: Ability,
                  attributes: ["abilityName"],
                  where: {
                    status: DRIVERS.STATUS.ACTIVE
                  },
                  include: [
                    {
                      model: AbilityType,
                      attributes: ["abilityTypeName"],
                      where: {
                        status: DRIVERS.STATUS.ACTIVE
                      },
                      required: false,
                      paranoid: false,
                    },
                  ],
                  required: true,
                  paranoid: false,
                },

              ],
              raw: true,
              nest: true,
              limit: pData.limit,
              offset: pData.offset,
            })) as DriverSkillsDto[];
            resolve(retSkills);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];

      const skills: any = querySkills as DriverSkillsDto[];
      const skillDatas: any[] = [];
      for (const skill of skills) {
        const data: DriverSkillsDto = {
          personalAbilityId: skill.personalAbilityId,
          abilityTypeName: skill.Ability.AbilityType.abilityTypeName,
          abilityName: skill.Ability.abilityName,
          score: skill.score,
        };
        skillDatas.push(data);
      }
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const skillsResponse: CommonResponseListDto<DriverSkillsDto> = {};
      const maxPageSpageSkills: number = Math.ceil(totalDataCount / rowSkills);
      const nextPage: number | null = pageSkills + 2 > maxPageSpageSkills ? null : pageSkills + 2;
      skillsResponse.page = pageSkills + 1;
      skillsResponse.nextPage = nextPage;
      skillsResponse.row = Number(rowSkills);
      skillsResponse.total = totalDataCount;
      skillsResponse.data = skillDatas;

      return skillsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getSkillsCard",
        this.traceFileName
      );
    }
  }

  public async getListPersonalSubArea(commonRequest: CommonRequest) {
    this.logger.info("[DAO getListPersonalSubArea]. . .start");
    try {
      const personalSubArea: any = await PersonalSubArea.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: [
          "personalSubAreaId",
          "personalSubAreaCode",
          "personalSubAreaName",
          "status",
          "createdBy",
          "createdAt",
          "modifiedBy",
          "modifiedAt"
        ]
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver's list personal sub area!";
      response.data = personalSubArea;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getListPersonalSubArea", this.traceFileName);
    }
  }

  public async getPersonalSubAreaById(commonRequest: CommonRequest) {
    this.logger.info("[DAO getPersonalSubAreaById]. . .start");
    const personalSubAreaId: number = commonRequest.body.personnelAreaId;
    try {
      const personalSubArea: any = await PersonalSubArea.findOne({
        logging: console.log,
        subQuery: false,
        raw: true,
        where: {
          personalSubAreaId
        }
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get personal sub area by id";
      response.data = personalSubArea;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getPersonalSubAreaById", this.traceFileName);
    }
  }

  public async getDriverCustomerPosition(commonRequest: CommonRequest) {
    this.logger.info("[DAO getDriverCustomerPosition]. . .start");
    try {
      const driverCustomerInformation: any = await CustomerPosition.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: [
          "customerPositionId",
          "customerPositionName"
        ],
      });

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.message = "Successfully get list of driver customer information!";
      response.data = driverCustomerInformation;

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDriverCustomerPosition", this.traceFileName
      );
    }
  }
  // public async getReadyDriverByPersonalDataId(commonRequest: CommonRequest) {
  //   this.logger.info("dao getPersonalDataById...start");
  //   try {
  //     let personalDataId: number = Number(
  //       commonRequest.params?.personalDataId || null
  //     );
  //     isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

  //     const whereClause: {} = {
  //       personalDataId,
  //       status: DRIVERS.STATUS.ACTIVE,
  //     };

  //     const filter: any = {
  //       logging: console.log,
  //       raw: true,
  //       attributes: [
  //         "personalDataId",
  //         "placementBranchId",
  //         "placementLocationId",
  //       ],
  //       where: whereClause,
  //     };

  //     const response: any = await PersonalData.findOne(filter);
  //     return response;
  //   } catch (error) {
  //     throw applicationInsightsService.errorModel(
  //       error,
  //       "getPersonalDataById",
  //       this.traceFileName
  //     );
  //   }
  // }
  public async getReadyDriverByPersonalDataId(commonRequest: CommonRequest) {
    this.logger.info("dao getReadyDriverByPersonalDataId...start");
    try {
      let personalDataId: number = Number(
        commonRequest.params?.personalDataId || null
      );
      isNaN(personalDataId) ? (personalDataId = 0) : (personalDataId = personalDataId);

      const whereClause: {} = {
        personalDataId,
        status: DRIVERS.STATUS.ACTIVE,
        transactionId: {
          [Op.ne]: null
        }
      };

      const whereClausePersonalContract: {} = {
        status: DRIVERS.STATUS.ACTIVE,
        [Op.or]: [
          {
            contractStatus: DRIVERS.CONTRACT_STATUS.EXPIRY_ON,
          },
          {
            contractStatus: DRIVERS.CONTRACT_STATUS.ACTIVE,
          },
        ],

      };

      const filter: any = {
        logging: console.log,
        raw: true,
        attributes: [
          "personalDataId",
          "transactionId",
        ],
        where: whereClause,
        include: [
          {
            model: PersonalContract,
            attributes: ["personalDataId", "contractStatus"],
            required: true,
            paranoid: false,
            where: whereClausePersonalContract,
            order: [
              ["personalDataId", "asc"],
              ["contractStart", "desc"],
              ["contractEnd", "desc"],
            ],
          },
        ],
      };

      const user: any = await PersonalData.findOne(filter);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getReadyDriverByPersonalDataId",
        this.traceFileName
      );
    }
  }
}
