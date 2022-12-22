import * as stackTrace from "stack-trace";
import { CommonRequest, CommonResponseListDto, ResponseDataDto, CommonResponseDto } from "astrafms-common-dto-interface";
import { applicationInsightsService, Logger } from "astrafms-services-error-logging";
import { DatabaseCredential } from "../../private/database.credential"
import { sequelizer } from "../../private/initialize.database";
import { PersonalDataAttribute, PersonalContractAttribute, PersonalCicoPoolAttribute, PersonalIdentityAttribute } from "../../models/interfaces/index";
import { CicoPoolModel, DocumentsModel } from "astrafms-common-dto-interface-driver-mangement";
import { PersonalData } from "../../models/personal.data.model";
import { PersonalContract } from "../../models/personal.contract.model";
import { PersonalCicoPool } from "../../models/personal.cico.pool.model";
import { PersonalIdentity } from "../../models/personal.identity.model";
import { PersonalMCU } from "../../models/personal.mcu.model";
import { STATUS_CODE, DRIVERS } from "../../constants/CONSTANTS.json";
import Sequelize from 'sequelize';
const Op = Sequelize.Op;

export class CommandDao {
    private logger: any = Logger.getLogger("./dao/mssql/driver.dao")
    private trace: any;
    private traceFileName: any;

    constructor(host: string | null, username: string | null, password: string | null, databaseName: string | null) {
        this.trace = stackTrace.get();
        this.traceFileName = this.trace[0].getFileName();
        DatabaseCredential.set(host, username, password, databaseName);
        if (host) {
            sequelizer.sync();
        }
    }

    // -=-=-=-=-=---=- PERSONAL DATA-=-=-=-=-=-=-- //

    public async createPersonalData(commonRequest: CommonRequest) {
        this.logger.info("[DAO] createPersonalData...start");
        try {
            const weight: number = commonRequest.body.personalInformation?.weight ? commonRequest.body.personalInformation?.weight.toFixed(2) : null;
            const height: number = commonRequest.body.personalInformation?.height ? commonRequest.body.personalInformation?.height.toFixed(2) : null;
            const personalDataAttribute: PersonalDataAttribute = {
                personalCode: commonRequest.body.generalInformation?.personalId,
                nrp: commonRequest.body.generalInformation?.personalId,
                fullName: commonRequest.body.generalInformation?.fullName,
                birthPlace: commonRequest.body.personalInformation?.placeOfBirth,
                birthDate: commonRequest.body.personalInformation?.dateOfBirth,
                handphone: commonRequest.body.professionalBackground?.phoneNumber,
                email: commonRequest.body.professionalBackground?.email,
                joinDate: commonRequest.body.professionalBackground?.joinedDate,
                customerPosition: commonRequest.body.professionalBackground?.customerPosition,
                assignmentCompanyId: commonRequest.body.generalInformation?.companyId,
                assignmentCompanyCode: commonRequest.body.generalInformation?.companyCode,
                assignmentCompanyName: commonRequest.body.generalInformation?.companyName,
                assignmentBranchId: commonRequest.body.generalInformation?.personnelAreaId,
                assignmentBranchCode: commonRequest.body.generalInformation?.personnelAreaCode,
                assignmentBranchName: commonRequest.body.generalInformation?.personnelAreaName,
                placementBusinessUnitId: commonRequest.body.professionalBackground?.businessUnitId,
                placementBusinessUnitCode: commonRequest.body.professionalBackground?.businessUnitCode,
                placementBusinessUnitName: commonRequest.body.professionalBackground?.businessUnitName,
                placementBranchId: commonRequest.body.professionalBackground?.branchId,
                placementBranchCode: commonRequest.body.professionalBackground?.branchCode,
                placementBranchName: commonRequest.body.professionalBackground?.branchName,
                placementLocationId: commonRequest.body.professionalBackground?.poolId,
                placementLocationCode: commonRequest.body.professionalBackground?.poolCode,
                placementLocationName: commonRequest.body.professionalBackground?.poolName,
                photoFront: commonRequest.body.generalInformation?.photoFront,
                photoLeft: commonRequest.body.generalInformation?.photoLeft,
                photoRight: commonRequest.body.generalInformation?.photoRight,
                bankId: commonRequest.body.professionalBackground?.bankId,
                bankAccountNumber: commonRequest.body.professionalBackground?.bankAccountNumber,
                bankAccountName: commonRequest.body.professionalBackground?.bankAccountHoldername,
                maritalStatusId: commonRequest.body.personalInformation?.maritalStatusId,
                maritalDate: commonRequest.body.personalInformation?.maritalDate,
                religionId: commonRequest.body.personalInformation?.religionId,
                nationalityId: commonRequest.body.personalInformation?.nationalityId,
                uniformSize: commonRequest.body.personalInformation?.uniformSize,
                shoesSize: commonRequest.body.personalInformation?.shoeSize,
                pantsSize: commonRequest.body.personalInformation?.pantsSize,
                weight,
                height,
                bloodType: commonRequest.body.personalInformation?.bloodType,
                isDriver: true,
                genderId: commonRequest.body.personalInformation?.genderId,
                employeeStatusId: 1,
                status: commonRequest.body.status,
                createdBy: commonRequest.headers.userId,
                createdAt: new Date().toISOString(),
                modifiedBy: commonRequest.headers.userId,
                modifiedAt: new Date().toISOString(),
                version: 1,
                transactionId: commonRequest.headers.transactionId,
                customerId: commonRequest.body.professionalBackground.customerId,
                customerCode: commonRequest.body.professionalBackground.customerCode,
                customerName: commonRequest.body.professionalBackground.customerName,
                // costCenterCode: 0,
                // costCenterName: "",
                // currentLocationLong: 0,
                // currentLocationLat: 0,
                // currentLocationUpdateTime: "",
                // SAPSyncDate: "",
                // employeeStatusId: 0,
                // coordinatorUserId: "",
                // coordinatorUserCode: "",
                // coordinatorUserName: "",
                // coordinatorUserRoleName: "",
                // customerContractNumber: "",
            }

            const personalData: any = await PersonalData.create(personalDataAttribute);
            const result = personalData.get({ plain: true });

            const response: ResponseDataDto = {};
            response.transactionId = commonRequest.headers?.transactionId;
            response.code = STATUS_CODE.SUCCESS.OK;
            response.message = "Successfully create personal data";
            response.data = result;

            return response;
        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "[DAO] createPersonalData", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "[DAO] createPersonalData", this.traceFileName);
        }
    }

    private async updatePersonalDataScheduler(body: any, params: any, t: any) {
        this.logger.info("[DAO updatePersonalDataScheduler]...start");
        try {
            const whereClause: any = {
                'personalDataId': {
                    [Op.in]: params
                }
            }
            const res: any = await PersonalData.update(
                body,
                { returning: true, where: whereClause, transaction: t }
            );
            return true
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updatePersonalDataScheduler", this.traceFileName);
        }
    }

    public async updatePersonal(commonRequest: CommonRequest) {
        this.logger.info("[DAO]  updatePersonal...start")
        try {
            // const arrBody: any = {
            //   status: commonRequest.body.status,
            //   modifiedBy: commonRequest.headers.userId,
            //   modifiedAt: new Date().toISOString()
            // };
            const arrBody: any = commonRequest.body.personalData
            const filter: any = {
                where: { personalDataId: commonRequest.params.personalDataId },
                logging: console.log
            }
            const result: any = await PersonalData.update(
                arrBody,
                filter,
            );
            const res: CommonResponseDto = {
                transactionId: commonRequest.headers?.transactionId,
                message: "Successfully update personal ",
                code: 200,
            }
            return res;
        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "updatePersonal", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "updatePersonal", this.traceFileName);
        }
    }

    public async updatePersonalStatusActive(commonRequest: CommonRequest) {
        this.logger.info("updatePersonalStatusActive...start")
        const body = commonRequest.body;
        try {
            const personalDataId: any = body.personalDataId;
            const filter = {
                where: { personalDataId },
            };
            const updateAttr = {
                status: body.status
            }
            const personaltem: any = await PersonalData.findOne(filter);
            const result = personaltem.get({ plain: true });
            if (result) {
                result.status = 2;
                await PersonalData.update(
                    updateAttr,
                    filter);
                const res: CommonResponseDto = {
                    transactionId: commonRequest.headers?.transactionId,
                    message: "Successfully update  Personal data",
                    code: 200,
                }
                return res;
            } else {
                throw new Error("personalData Id not found");
            }
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updatePersonalStatusActive", this.traceFileName);
        }
    }

    public async updateStatusPersonalData(commonRequest: CommonRequest) {
        this.logger.info("[SERVICE] updateStatusPersonalData...start");
        try {
            const personalDataId: number = commonRequest.body.personalDataId;
            const status: number = commonRequest.body.status;

            const filter = {
                where: { personalDataId },
            };
            const updateAttr = {
                status
            }

            await PersonalData.update(
                updateAttr,
                filter
            );

            const response: CommonResponseDto = {};
            response.transactionId = commonRequest.headers?.transactionId;
            response.code = STATUS_CODE.SUCCESS.OK;
            response.message = "Successfully update status personal data";

            return response;

        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateStatusPersonalData", this.traceFileName);
        }
    }

    // -=-=-=-=-=---=- PERSONAL CONTRACT -=-=-=-=-=-=-- //

    private async updateContractStatusUsingSchedulerCondition(type: string, body: any, params: any, t: any) {
        this.logger.info("[DAO updateContractStatusUsingSchedulerCondition]...start");


        try {
            const whereClause: any = {
                'personalContractId': {
                    [Op.in]: params
                }
            };
            const res: any = await PersonalContract.update(
                body,
                { returning: true, where: whereClause, transaction: t }
            );
            return true
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateContractStatusUsingSchedulerCondition", this.traceFileName);
        }
    }

    private async updateContractStatusUsingSchedulerConditionNotIn(body: any, params: any, t: any) {
        this.logger.info("[DAO updateContractStatusUsingSchedulerConditionNotIn]...start");
        try {
            const whereClause: any = {
                'personalContractId': {
                    [Op.notIn]: params
                },
                'contractStatus': {
                    [Op.ne]: 0
                }
            };
            const res: any = await PersonalContract.update(
                body,
                { returning: true, where: whereClause, transaction: t }
            );
            return res
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateContractStatusUsingSchedulerConditionNotIn", this.traceFileName);
        }
    }

    public async updateContractStatusUsingScheduler(commonRequest: CommonRequest, t: any) {
        this.logger.info("[DAO updateContractStatusUsingScheduler]...start");
        const pNotStarted = commonRequest.params?.notStarted.length > 0 ? this.updateContractStatusUsingSchedulerCondition("notStarted", commonRequest.body?.active, commonRequest.params?.notStarted, t) : Promise.resolve();
        const pActive = commonRequest.params?.active.length > 0 ? this.updateContractStatusUsingSchedulerCondition("active", commonRequest.body?.active, commonRequest.params?.active, t) : Promise.resolve();
        const pExpiryOn = commonRequest.params?.expiryOn.length > 0 ? this.updateContractStatusUsingSchedulerCondition("expiryOn", commonRequest.body?.expiryOn, commonRequest.params?.expiryOn, t) : Promise.resolve();
        const pExpired = commonRequest.params?.expired.length > 0 ? this.updateContractStatusUsingSchedulerCondition("expired", commonRequest.body?.expired, commonRequest.params?.expired, t) : Promise.resolve();
        const pPersonalData = commonRequest.params?.personalData.length > 0 ? this.updatePersonalDataScheduler(commonRequest.body?.personalData, commonRequest.params?.personalData, t) : Promise.resolve();
        const pPersonalContractId = commonRequest.params?.personalContractId.length > 0 ? this.updateContractStatusUsingSchedulerConditionNotIn(commonRequest.body?.expired, commonRequest.params?.personalContractId, t) : Promise.resolve();
        try {
            const [
                resNotStarted,
                resActive,
                resExpiryOn,
                resExpired,
                resPersonalData,
                resPersonalContractId
            ] = await Promise.all(
                [
                    pNotStarted,
                    pActive,
                    pExpiryOn,
                    pExpired,
                    pPersonalData,
                    pPersonalContractId
                ]
            );
            await t.commit();
            return true;
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateContractStatusUsingScheduler", this.traceFileName);
        }
    }

    public async createPersonalContract(commonRequest: CommonRequest) {
        this.logger.info("[DAO] createPersonalContract...start")
        try {
            let contractStatusMapped: number = 0;
            const now: any = new Date();
            const contractEnd: any = new Date(commonRequest.body.professionalBackground?.contractEnd);
            const contractStart: any = new Date(commonRequest.body.professionalBackground?.contractStart);
            const diffInMs: number = contractEnd - now;
            const diff: number = Math.ceil(Number(diffInMs / (1000 * 60 * 60 * 24)));
            const invalidInMs: number = contractEnd - contractStart;
            const invalid: number = Math.ceil(Number(invalidInMs / (1000 * 60 * 60 * 24)));

            if (contractStart <= now && diff <= 30 && (contractEnd >= now))
                contractStatusMapped = DRIVERS.CONTRACT_STATUS.EXPIRY_ON
            else if ((contractEnd < now && diff < 0) || invalid < 0)
                contractStatusMapped = DRIVERS.CONTRACT_STATUS.EXPIRED
            else if (diff > 30 && contractStart <= now && contractEnd >= now)
                contractStatusMapped = DRIVERS.CONTRACT_STATUS.ACTIVE
            else if (contractStart > now)
                contractStatusMapped = DRIVERS.CONTRACT_STATUS.NOT_STARTED

            const personalContractAttribute: PersonalContractAttribute = {
                personalDataId: commonRequest.body.personalDataId,
                contractTypeCode: commonRequest.body.professionalBackground?.contractTypeCode,
                contractStart,
                contractEnd,
                terminationDate: null,
                contractStatus: contractStatusMapped,
                status: commonRequest.body.status,
                createdBy: commonRequest.headers.userId,
                createdAt: new Date().toISOString(),
                modifiedBy: commonRequest.headers.userId,
                modifiedAt: new Date().toISOString(),
                version: 1,
            }

            await PersonalContract.create(personalContractAttribute);

            const response: CommonResponseDto = {};
            response.transactionId = commonRequest.headers?.transactionId;
            response.code = STATUS_CODE.SUCCESS.OK;
            response.message = "Successfully create personal contract";

            return response;
        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "[DAO] createPersonalContract", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "[DAO] createPersonalContract", this.traceFileName);
        }
    }

    // -=-=-=-=-=---=- PERSONAL PLACEMENT -=-=-=-=-=-=-- //

    public async deletePermanentPersonalCicoPool(commonRequest: CommonRequest) {
        this.logger.info("[deletePermanentPersonalCicoPool]...start");
        try {
            const whereClause: any = {};
            const headers: any = commonRequest.headers;
            const params: any = commonRequest.params;

            const retRolePosition: any = await PersonalCicoPool.destroy({
                where: {
                    personalDataId: params.personalDataId
                },
                logging: console.log,
            });
            const cicoPools: any = {};
            cicoPools.transactionId = commonRequest.headers?.transactionId;
            cicoPools.message = "Successfully delete cico pool ";
            cicoPools.data = retRolePosition;

            return cicoPools;
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "deletePermanentPersonalCicoPool", this.traceFileName);
        }
    }

    // -=-=-=-=-=---=- PERSONAL CICO POOL -=-=-=-=-=-=-- //

    public async createPersonalCicoPool(commonRequest: CommonRequest) {
        this.logger.info("[DAO] createPersonalCicoPool...start");
        try {
            if (commonRequest.body.cicoPools) {
                const body = commonRequest.body.cicoPools;

                const arrBody: any[] = body;
                // remove data type
                const arrData: any[] = JSON.parse(JSON.stringify(arrBody));
                await PersonalCicoPool.bulkCreate(arrData);

            } else if (commonRequest.body.generalInformation.cicoPool) {
                const cicoPools: CicoPoolModel[] = commonRequest.body.generalInformation.cicoPool;
                const personalCicoPools: PersonalCicoPoolAttribute[] = [];

                for (const cicoPool of cicoPools) {
                    const personalCicoPool: PersonalCicoPoolAttribute = {
                        personalDataId: commonRequest.body.personalDataId,
                        assignmentLocationId: cicoPool.cicoPoolId,
                        assignmentLocationCode: cicoPool.cicoPoolCode,
                        assignmentLocationName: cicoPool.cicoPoolName,
                        status: commonRequest.body.status,
                        createdBy: commonRequest.headers.userId,
                        createdAt: new Date().toISOString(),
                        modifiedBy: commonRequest.headers.userId,
                        modifiedAt: new Date().toISOString(),
                        version: 1,
                    }
                    personalCicoPools.push(personalCicoPool);
                }

                await PersonalCicoPool.bulkCreate(personalCicoPools);
            }

            const response: CommonResponseDto = {};
            response.transactionId = commonRequest.headers?.transactionId;
            response.code = STATUS_CODE.SUCCESS.OK;
            response.message = "Successfully create personal cico pool";

            return response;

        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "[DAO] createPersonalCicoPool", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "[DAO] createPersonalCicoPool", this.traceFileName);
        }
    }

    // -=-=-=-=-=---=- PERSONAL IDENTITY -=-=-=-=-=-=-- //

    private async updateIdentityStatusUsingSchedulerCondition(body: any, params: any, t: any) {
        this.logger.info("DAO updateIdentityStatusUsingSchedulerCondition...start");
        try {
            const whereClause: any = {
                'personalIdentityId': {
                    [Op.in]: params
                }
            };
            const res: any = await PersonalIdentity.update(
                body,
                { returning: true, where: whereClause, transaction: t }
            );
            return true
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateIdentityStatusUsingSchedulerCondition", this.traceFileName);
        }
    }

    public async updateIdentityStatusUsingScheduler(commonRequest: CommonRequest, t: any) {
        this.logger.info("[DAO updateIdentityStatusUsingScheduler]...start");
        const pExpiryOn = commonRequest.params?.expiryOn.length > 0 ? this.updateIdentityStatusUsingSchedulerCondition(commonRequest.body?.expiryOn, commonRequest.params?.expiryOn, t) : Promise.resolve();
        const pExpired = commonRequest.params?.expired.length > 0 ? this.updateIdentityStatusUsingSchedulerCondition(commonRequest.body?.expired, commonRequest.params?.expired, t) : Promise.resolve();
        const pActive = commonRequest.params?.active.length > 0 ? this.updateIdentityStatusUsingSchedulerCondition(commonRequest.body?.active, commonRequest.params?.active, t) : Promise.resolve();
        const pPersonalData = commonRequest.params?.personalData.length > 0 ? this.updatePersonalDataScheduler(commonRequest.body?.personalData, commonRequest.params?.personalData, t) : Promise.resolve();
        try {
            const [
                resExpiryOn,
                resExpired,
                resActive,
                resPersonalData
            ] = await Promise.all(
                [
                    pExpiryOn,
                    pExpired,
                    pActive,
                    pPersonalData
                ]
            );
            await t.commit();
            return true;
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateIdentityStatusUsingScheduler", this.traceFileName);
        }
    }

    public async createPersonalIdentity(commonRequest: CommonRequest) {
        this.logger.info("[DAO] createPersonalIdentity...start");
        try {
            const documents: DocumentsModel[] = commonRequest.body.documents;
            const personalIdentities: PersonalIdentityAttribute[] = [];
            let identityStatusMapped: number = 0;

            for (const document of documents) {
                const now: any = new Date();
                const contractEnd: any = new Date(document.expirationDate);
                const diffInMs: number = contractEnd - now;
                const diff: number = Math.ceil(Number(diffInMs / (1000 * 60 * 60 * 24)));

                if (diff <= 30 && diff > 0 && document.expirationDate != null)
                    identityStatusMapped = 2
                else if (contractEnd < now && diff < 0 && diff > 30 && document.expirationDate != null)
                    identityStatusMapped = 0
                else if (diff > 30 && contractEnd >= now || document.expirationDate == null)
                    identityStatusMapped = 1

                const personalIdentity: PersonalIdentityAttribute = {
                    personalDataId: commonRequest.body.personalDataId,
                    identityTypeId: document.identityTypeId,
                    identityAccountNumber: document.identityNumber,
                    identityValidTo: document.expirationDate,
                    status: commonRequest.body.status,
                    identityStatus: identityStatusMapped,
                    createdBy: commonRequest.headers.userId,
                    createdAt: new Date().toISOString(),
                    modifiedBy: commonRequest.headers.userId,
                    modifiedAt: new Date().toISOString(),
                    version: 1,
                }
                personalIdentities.push(personalIdentity);
            }

            await PersonalIdentity.bulkCreate(personalIdentities);

            const response: CommonResponseDto = {};
            response.transactionId = commonRequest.headers?.transactionId;
            response.code = STATUS_CODE.SUCCESS.OK;
            response.message = "Successfully create personal identity";

            return response;
        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "[DAO] createPersonalIdentity", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "[DAO] createPersonalIdentity", this.traceFileName);
        }
    }

    // -=-=-=-=-=---=- PERSONAL MCU -=-=-=-=-=-=-- //

    private async updateMcuStatusUsingSchedulerCondition(body: any, params: any, t: any) {
        this.logger.info("DAO updateMcuStatusUsingSchedulerCondition...start");
        try {
            const whereClause: any = {
                'personalMCUId': {
                    [Op.in]: params
                }
            };
            const res: any = await PersonalMCU.update(
                body,
                { returning: true, where: whereClause, transaction: t }
            );
            return true
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateMcuStatusUsingSchedulerCondition", this.traceFileName);
        }
    }

    public async updateMcuStatusUsingScheduler(commonRequest: CommonRequest, t: any) {
        this.logger.info("[DAO updateMcuStatusUsingScheduler]...start");
        const pExpiryOn = commonRequest.params?.expiryOn.length > 0 ? this.updateMcuStatusUsingSchedulerCondition(commonRequest.body?.expiryOn, commonRequest.params?.expiryOn, t) : Promise.resolve();
        const pExpired = commonRequest.params?.expired.length > 0 ? this.updateMcuStatusUsingSchedulerCondition(commonRequest.body?.expired, commonRequest.params?.expired, t) : Promise.resolve();
        const pActive = commonRequest.params?.active.length > 0 ? this.updateMcuStatusUsingSchedulerCondition(commonRequest.body?.active, commonRequest.params?.active, t) : Promise.resolve();
        const pPersonalData = commonRequest.params?.personalData.length > 0 ? this.updatePersonalDataScheduler(commonRequest.body?.personalData, commonRequest.params?.personalData, t) : Promise.resolve();
        try {
            const [
                resExpiryOn,
                resExpired,
                resActive,
                resPersonalData
            ] = await Promise.all(
                [
                    pExpiryOn,
                    pExpired,
                    pActive,
                    pPersonalData
                ]
            );
            await t.commit();
            return true;
        } catch (error) {
            throw applicationInsightsService.errorModel(error, "updateMcuStatusUsingScheduler", this.traceFileName);
        }
    }

    public async savePersonalData(commonRequest: CommonRequest) {
        this.logger.info("[DAO]  savePersonalData...start")
        try {

            const arrBody: any = commonRequest.body
            const filter: any = {
                where: { personalDataId: commonRequest.params.personalDataId },
                logging: console.log
            }
            const result: any = await PersonalData.update(
                arrBody,
                filter,
            );

            const res: CommonResponseDto = {
                transactionId: commonRequest.body?.transactionId,
                message: "Successfully save Personal Data  ",
                code: 200,
            }

            return res;
        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "updatePersonal", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "updatePersonal", this.traceFileName);
        }
    }

    public async savePersonalContractByPersonalContractId(commonRequest: CommonRequest) {
        this.logger.info("[DAO]  savePersonalContractByPersonalContractId ...start")
        try {
            // const arrBody: any = {
            //   status: commonRequest.body.status,
            //   modifiedBy: commonRequest.headers.userId,
            //   modifiedAt: new Date().toISOString()
            // };

            const arrBody: any = commonRequest.body
            const filter: any = {
                where: { personalContractId: commonRequest.params.personalContractId },
                logging: console.log
            }
            const result: any = await PersonalContract.update(
                arrBody,
                filter,
            );
            const res: CommonResponseDto = {
                transactionId: commonRequest.body?.transactionId,
                message: "Successfully save Personal Contract",
                code: 200,
            }
            return res;
        } catch (error) {
            const err: any = error;
            if (err?.name === "SequelizeUniqueConstraintError") {
                const errModel: any = {
                    code: 400,
                    message: "SequelizeUniqueConstraintError",
                    appInsightRaw: error
                };
                throw applicationInsightsService.errorModel(errModel, "savePersonalContractByPersonalContractId", this.traceFileName);
            }
            throw applicationInsightsService.errorModel(error, "savePersonalContractByPersonalContractId", this.traceFileName);
        }
    }
}
