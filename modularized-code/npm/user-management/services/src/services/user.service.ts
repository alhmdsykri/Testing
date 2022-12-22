import { STATUS_CODE, REDIS_CACHE, PBAC, EXTERNAL_API } from "../constants/CONSTANTS.json";
import { ERROR, SUCCESS } from "../constants/MESSAGES.json";
import * as stackTrace from "stack-trace";
import { applicationInsightsService, Logger, ErrorModel } from "astrafms-services-error-logging";
import { CommonRequest, CommonResponseDto, ICreateRole, IPermissions, CommonResponseListDto } from "astrafms-common-dto-interface";
import { RolePositionIdsResponse } from "../dto/role.positions.ids.response"
import { PbacPermissionDto } from "../dto/pbac.permission.dto";
import { UserDao, sequelize, RolePermissionAttributes } from "astrafms-db-mssql-user-management";
import { externalAPIService } from "astrafms-services-utilities";
import { Redis } from "../redis/redis";
import * as _ from "lodash";
import { isArray } from "lodash";
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private logger: any = Logger.getLogger("./services/user.service")
  private trace: any;
  private traceFileName: any;
  private userDao: UserDao;
  private redis: Redis;

  constructor(host: string | null, username: string | null, password: string | null, databaseName: string | null,
    redisHost: string | null, redisKey: string | null) {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
    this.userDao = new UserDao(null, null, null, null);
    this.redis = new Redis(null, null)
    if (host) {
      sequelize.sync();
      this.userDao = new UserDao(host, username, password, databaseName);
    }
    if (redisHost) {
      this.redis = new Redis(redisHost, redisKey)
    }
  }

  // -=-=-=-=-=---=- USER -=-=-=-=-=-=-- //

  public async getUsers(commonRequest: CommonRequest) {
    this.logger.info("[getUsers]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getUsers(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUsers", this.traceFileName);
    }
  }

  public async getDataRoleByRoleId(commonRequest: CommonRequest) {
    this.logger.info("[getDataRoleByRoleId]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getDataRoleByRoleId(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataRoleByRoleId", this.traceFileName);
    }
  }

  public async getUserById(commonRequest: CommonRequest) {
    this.logger.info("getUserById...start");
    try {
      const result: any = await this.userDao.getUserById(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserById", this.traceFileName);
    }
  }

  public async updateUser(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateUser start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const body: any = {
        firstName: reqBody.payload.name.split(' ').slice(0, -1).join(' '),
        lastName: reqBody.payload.name.split(' ').slice(-1).join(' '),
        userName: reqBody.payload.email,
        email: reqBody.payload.email,
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
        status: reqBody.status,
        transactionId: reqBody.transactionId
      };
      const params: any = {
        userId: reqBody.payload.userId
      }
      commonRequest.body = body;
      commonRequest.params = params;
      const result: any = await this.userDao.updateUser(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.UPDATE_USER;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateUser", this.traceFileName);
    }
  }

  public async updateStatusUser(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateStatusUser start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const body: any = {
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
        status: reqBody.status
      };
      const params: any = {
        userId: reqBody.payload.userId
      }
      commonRequest.body = body;
      commonRequest.params = params;
      const result: any = await this.userDao.updateStatusUser(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.UPDATE_STATUS_USER;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateStatusUser", this.traceFileName);
    }
  }

  public async createUserRole(commonRequest: CommonRequest) {
    this.logger.info("[createUserRole]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.createUserRole(commonRequest);
      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CREATE_USER_ROLE;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "createUserRole", this.traceFileName);
    }
  }

  public async deletePermanentUserRole(commonRequest: CommonRequest) {
    this.logger.info("[deletePermanentUserRole]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.deletePermanentUserRole(commonRequest);
      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETED_USER_ROLE;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "deletePermanentUserRole", this.traceFileName);
    }
  }


  // -=-=-=-=-=---=- ROLE -=-=-=-=-=-=-- //

  public async createRole(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] createRole start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const transactionId: any = commonRequest.headers?.transactionId;
      const isSuperAdmin: boolean | null = (reqBody.payload.isSuperAdmin) ? true : false;
      const roleAttr: any = {
        name: reqBody.payload.name,
        isSuperAdmin,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        version: 1,
        uniqueKey: reqBody.payload.name,
        status: reqBody.status,
        transactionId: reqBody.transactionId
      };
      const body: any = {
        role: roleAttr
      };
      commonRequest.body = body;
      const result: any = await this.userDao.createRole(commonRequest);
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.CREATE_ROLE;
      response.data = result;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createRole", this.traceFileName);
    }
  }

  public async updateRole(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateRole start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const isSuperAdmin: boolean | null = reqBody.payload.isSuperAdmin;
      const body: any = {
        name: reqBody.payload.name,
        isSuperAdmin,
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
        status: reqBody.status,
        transactionId: reqBody.transactionId
      };

      // if isSuperAdmin is not present in req body, the current data should preserve
      if (reqBody.payload.isSuperAdmin == null) {
        delete body.isSuperAdmin
      }


      const params: any = {
        roleId: reqBody.roleId
      }
      commonRequest.body = body;
      commonRequest.params = params;
      const result: any = await this.userDao.updateRole(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.CREATE_ROLE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateRole", this.traceFileName);
    }
  }

  public async updateRoleStatus(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateRoleStatus start..`);
      const reqBody: any = commonRequest.body;
      const body: any = {
        roleId: reqBody.roleId,
        status: reqBody.status
      }
      commonRequest.body = body;
      const result: any = await this.userDao.updateRoleStatus(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.CREATE_ROLE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateRole", this.traceFileName);
    }
  }

  public async getRoleById(commonRequest: CommonRequest) {
    this.logger.info("getRoleById...start");
    try {
      const result: any = await this.userDao.getRoleById(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRoleById", this.traceFileName);
    }
  }

  public async getSuperAdminRoleIds(commonRequest: CommonRequest) {
    this.logger.info("[getSuperAdminRoleIds]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getSuperAdminRoleIds(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getSuperAdminRoleIds", this.traceFileName);
    }
  }

  public async getRoles(commonRequest: CommonRequest) {
    this.logger.info("[getRoles]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getRoles(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRoles", this.traceFileName);
    }
  }

  public async getRole(commonRequest: CommonRequest) {
    this.logger.info("[getRole]...start");
    try {
      const result: any = await this.userDao.getRole(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRole", this.traceFileName);
    }
  }

  public async getRoleByName(commonRequest: CommonRequest) {
    this.logger.info("getRoleByName...start");
    try {
      const result: any = await this.userDao.getRoleByName(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRoleByName", this.traceFileName);
    }
  }

  public async getUserRoles(commonRequest: CommonRequest) {
    this.logger.info("getUserRoles...start");
    try {
      const result: any = await this.userDao.getUserRoles(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserRoles", this.traceFileName);
    }
  }

  public async getRolesInIds(commonRequest: CommonRequest) {
    this.logger.info("getRolesInIds...start");
    try {
      const result: any = await this.userDao.getRolesInIds(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRolesInIds", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- ROLE PERMISSION -=-=-=-=-=-=-- //

  public async createRolePermission(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] createRolePermission start..`);
      const permissionsBody: any[] = [];
      const reqBody: any = commonRequest.body;
      const roleId: any = reqBody.userId;
      if (reqBody.payload.permissions && reqBody.payload.permissions.length > 0) {
        reqBody.payload.permissions.map((permission: any) => {
          const permissionBody: RolePermissionAttributes = {
            createdBy: roleId,
            createdAt: new Date().toISOString(),
            version: 1,
            status: reqBody.status,
            roleId: reqBody.roleId,
            permissionId: permission.permissionId,
            visible: permission.v,
            enable: permission.e,
            active: permission.a,
            uniqueKey: ""
          };
          permissionsBody.push(permissionBody);
        });
      };
      const body: any = {
        permissions: permissionsBody
      }
      commonRequest.body = body;
      const result: any = await this.userDao.createRolePermission(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.CREATE_ROLE_PERMISSION;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createRolePermission", this.traceFileName);
    }
  }

  public async updateRolePermission(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateRolePermission start..`);
      const permissionsBody: any[] = [];
      const reqBody: any = commonRequest.body;
      const userName: any = commonRequest.headers?.userId;
      const params: any = {
        roleId: reqBody.roleId
      };
      if (reqBody.payload.permissions && reqBody.payload.permissions.length > 0) {
        reqBody.payload.permissions.map((permission: any) => {
          const permissionBody: any = {
            permissionId: permission.permissionId,
            modifiedBy: userName,
            modifiedAt: new Date().toISOString(),
            visible: permission.v,
            enable: permission.e,
            active: permission.a,
          }
          permissionsBody.push(permissionBody);
        });
      }
      const body: any = {
        permissions: permissionsBody
      }
      commonRequest.body = body;
      commonRequest.params = params;
      const result: any = await this.userDao.updateRolePermission(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.CREATE_ROLE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateRole", this.traceFileName);
    }
  }

  public async getPermissions(commonRequest: CommonRequest) {
    this.logger.info("[getPermissions]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getPermissions(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getPermissions", this.traceFileName);
    }
  }

  public async getRolePermission(commonRequest: CommonRequest) {
    this.logger.info("[getRolePermission]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getRolePermissions(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRolePermission", this.traceFileName);
    }
  }

  public async validatePermissionExist(commonRequest: CommonRequest) {
    this.logger.info("validatePermissionExist...start");
    const dataPermission: IPermissions[] = [];
    const dataRequest: IPermissions[] = commonRequest.body.permissions;
    try {
      const validatePermissionExist: any = await this.userDao.validatePermissionExist(commonRequest);
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < validatePermissionExist.length; i++) {
        dataPermission.push({
          ...validatePermissionExist[i],
          ...(dataRequest.find((itmInner) => itmInner.permissionId === validatePermissionExist[i].permissionId))
        }
        );
      }
      const result: ICreateRole = {
        name: commonRequest.body.name,
        isSuperAdmin: commonRequest.body?.isSuperAdmin,
        permissions: dataPermission
      }
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "validatePermissionExist", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- ROLE POSITION -=-=-=-=-=-=-- //

  public async getRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[getRolePosition]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getRolePosition(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRolePosition", this.traceFileName);
    }
  }

  public async getRolePositionDetails(commonRequest: CommonRequest) {
    this.logger.info("[getRolePositionDetails]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getRolePositionDetails(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRolePositionDetails", this.traceFileName);
    }
  }

  public async createRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[createRolePosition]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.createRolePosition(commonRequest);
      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CREATE_ROLE_POSITION;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "createRolePosition", this.traceFileName);
    }
  }

  public async deletePermanentRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[deletePermanentRolePosition]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.deletePermanentRolePosition(commonRequest);
      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CREATE_ROLE_POSITION;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "deletePermanentRolePosition", this.traceFileName);
    }
  }

  public async getValidationLocationRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[getValidationLocationRolePosition]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getValidationLocationRolePosition(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getValidationLocationRolePosition", this.traceFileName);
    }
  }

  // -=-=-=-=-=-=-=-=-=-=- CQRS ROLE POSITION -=-=-=-=-=-=-= //

  public async updateRolePositionLocationCQRS(commonRequest: CommonRequest) {
    this.logger.info("[updateRolePositionLocationCQRS]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.updateRolePositionLocationCQRS(commonRequest);
      if (result.length > 0) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CQRS.UPDATE_ROLE_POSITION.LOCATION;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "updateRolePositionLocationCQRS", this.traceFileName);
    }
  }
  public async deleteRolePositionLocationCQRS(commonRequest: CommonRequest) {
    this.logger.info("[deleteRolePositionLocationCQRS]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.deleteRolePositionLocationCQRS(commonRequest);
      if (result.length > 0) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CQRS.DELETE_ROLE_POSITION.LOCATION;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "deleteRolePositionLocationCQRS", this.traceFileName);
    }
  }
  public async updateRolePositionBranchCQRS(commonRequest: CommonRequest) {
    this.logger.info("[updateRolePositionBranchCQRS]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.updateRolePositionBranchCQRS(commonRequest);
      if (result.length > 0) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CQRS.UPDATE_ROLE_POSITION.BRANCH;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "updateRolePositionBranchCQRS", this.traceFileName);
    }
  }

  public async updateRolePositionBusinessUnitCQRS(commonRequest: CommonRequest) {
    this.logger.info("[updateRolePositionBusinessUnitCQRS]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.updateRolePositionBusinessUnitCQRS(commonRequest);
      if (result.length > 0) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CQRS.UPDATE_ROLE_POSITION.BU;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "updateRolePositionBusinessUnitCQRS", this.traceFileName);
    }
  }

  public async updateRolePositionCompanyCQRS(commonRequest: CommonRequest) {
    this.logger.info("[updateRolePositionCompanyCQRS]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.updateRolePositionCompanyCQRS(commonRequest);
      if (result.length > 0) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CQRS.UPDATE_ROLE_POSITION.COMPANY;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "updateRolePositionCompanyCQRS", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- ROLE APPROVAL -=-=-=-=-=-=-- //

  public async deleteRoleApprovalById(commonRequest: CommonRequest) {
    this.logger.info("deleteRoleApprovalById...start");
    try {
      const result: any = await this.userDao.deleteRoleApprovalById(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "deleteRoleApprovalById", this.traceFileName);
    }
  }

  public async getRoleApprovalById(commonRequest: CommonRequest) {
    this.logger.info("getRoleApprovalById...start");
    try {
      const result: any = await this.userDao.getRoleApprovalById(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRoleApprovalById", this.traceFileName);
    }
  }

  public async validateRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("validateRoleApproval...start");
    try {
      const result: any = await this.userDao.validateRoleApproval(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "validateRoleApproval", this.traceFileName);
    }
  }

  public async getDataTopicByTopicIds(TopicIds: any) {
    this.logger.info("getTopicByApprovalId...start");
    try {
      const result: any = await this.userDao.getDataTopicByTopicIds(TopicIds);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataTopicByTopicIds", this.traceFileName);
    }
  }

  public async getLevelByApprovalId(commonRequest: CommonRequest) {
    this.logger.info("getLevelByApprovalId...start");
    try {
      const result: any = await this.userDao.getLevelByApprovalId(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getLevelByApprovalId", this.traceFileName);
    }
  }

  public async getListRoleApprovals(commonRequest: CommonRequest) {
    this.logger.info("[getListRoleApprovals]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getListRoleApprovals(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getListRoleApprovals", this.traceFileName);
    }
  }

  public async getApprovalTopics(commonRequest: CommonRequest) {
    this.logger.info("[getApprovalTopics]...start");
    const query = commonRequest.query;
    try {
      const result: any = await this.userDao.getApprovalTopics(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getApprovalTopics", this.traceFileName);
    }
  }

  public async getApprovalLevels(commonRequest: CommonRequest) {
    this.logger.info("[getApprovalLevels]...start");
    const query = commonRequest.query;
    try {
      const roleApproval: any = await this.userDao.getAllLevelIdRoleApproval(commonRequest);
      try {
        const idApprovalMapped: any[] = []
        if (roleApproval.length > 0) {
          for (const ra of roleApproval) {
            idApprovalMapped.push(ra.dataValues.approvalLevel)
          }
        }
        const result: any = await this.userDao.getApprovalLevels(commonRequest, idApprovalMapped);
        return result;
      } catch (error) {
        throw applicationInsightsService.errorModel(error, "getApprovalLevels", this.traceFileName);
      }
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getApprovalLevels", this.traceFileName);
    }
  }

  public async deleteRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("[deleteRoleApproval]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.deleteRoleApproval(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE_APPROVAL;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "deleteRoleApproval", this.traceFileName);
    }
  }

  public async createRoleApprovals(commonRequest: CommonRequest) {
    this.logger.info("[createRoleApprovals]...start");
    try {
      const t: any = await sequelize.transaction();
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.createRoleApprovals(commonRequest, t);
      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.CREATE_ROLE_POSITION;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "createRoleApprovals", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- AUTHENTICATION SECTION -=-=-=-=-=-=-- //

  public async getUserByEmailOrUserNameOrPersonalId(commonRequest: CommonRequest) {
    this.logger.info("getUserByEmailOrUserNameOrPersonalId...start");
    try {
      const result: any = await this.userDao.getUserByEmailOrUserNameOrPersonalId(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserByEmailOrUserNameOrPersonalId", this.traceFileName);
    }
  }

  public async getUserPersonalIdOTP(commonRequest: CommonRequest) {
    this.logger.info("getUserPersonalIdOTP...start");
    try {
      const result: any = await this.userDao.getUserPersonalIdOTP(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserPersonalIdOTP", this.traceFileName);
    }
  }

  public async updateLoginStatus(commonRequest: CommonRequest) {
    this.logger.info("updateLoginStatus...start");
    try {
      const result: any = await this.userDao.updateLoginStatus(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateLoginStatus", this.traceFileName);
    }
  }

  public async resetLoginStatus(commonRequest: CommonRequest) {
    this.logger.info("[service]updateLoginStatus...start");
    try {
      const result: any = await this.userDao.resetLoginStatus(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "resetLoginStatus", this.traceFileName);
    }
  }

  public async deactivatePersonalIdOTP(commonRequest: CommonRequest) {
    this.logger.info("[service]deactivateOTP..start");
    try {
      const result: any = await this.userDao.deactivatePersonalIdOTP(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "deactivatePersonalIdOTP", this.traceFileName);
    }
  }

  // -=-=-=-=-=-=-=-=-=-=- ROLE PERMISSION REDIS SYNC -=-=-=-=-=-=-= //

  public async getRoleUsers(commonRequest: CommonRequest) {
    this.logger.info("getRoleUsers...start");
    try {
      let result: any = {};
      result = await this.userDao.getRoleUsers(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRoleUsers", this.traceFileName);
    }
  }

  public async getUsersByStatus(commonRequest: CommonRequest) {
    this.logger.info("getUsersByStatus...start");
    try {
      let result: any = {};
      result = await this.userDao.getUsersByStatus(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUsersByStatus", this.traceFileName);
    }
  }


  public async getUserAssociatedRole(commonRequest: CommonRequest) {
    this.logger.info("getUserAssociatedRole...start");
    try {
      let result: any = {};
      result = await this.userDao.getUserAssociatedRole(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserAssociatedRole", this.traceFileName);
    }
  }

  public async getAllRolesWithUsers(commonRequest: CommonRequest) {
    this.logger.info("getAllRolesWithUsers...start");
    try {
      let result: any = {};
      result = await this.userDao.getAllRolesWithUsers(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAllRolesWithUsers", this.traceFileName);
    }
  }

  public async generateUserRBACPBACPermissions(commonRequest: CommonRequest) {
    this.logger.info("generateUserRBACPBACPermissions...start");
    try {
      let result: any = {};
      result = await this.userDao.generateUserRBACPBACPermissions(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "generateUserRBACPBACPermissions", this.traceFileName);
    }
  }

  public async redisHSET(name: any, key: any, value: any) {
    try {
      const redisConn = await this.redis.getCacheConnection();
      const userKeys: any = await this.redis.hset(redisConn, name, key, value);
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "redisHSET", this.traceFileName);
    }
  }

  public async redisHDEL(name: any, key: any) {
    try {
      const redisConn = await this.redis.getCacheConnection();
      await this.redis.hdel(redisConn, name, key);
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "redisHDEL", this.traceFileName);
    }
  }

  public async redisDEL(name: any) {
    try {
      const redisConn = await this.redis.getCacheConnection();
      await this.redis.del(redisConn, name);
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "redisHDEL", this.traceFileName);
    }
  }


  public async createUserOTP(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] createUserOTP start..`);
      const reqBody: any = commonRequest.body;
      const transactionId: any = commonRequest.headers?.transactionId;
      const userOTPAttr: any = {
        userId: reqBody.userOTP.userId,
        otp: reqBody.userOTP.otp,
        isActive: reqBody.userOTP.isActive,
        createdAt: new Date().toISOString()
      };
      const body: any = {
        userOTP: userOTPAttr
      };
      commonRequest.body = body;
      const result: any = await this.userDao.createUserOTP(commonRequest);
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.CREATE_ROLE;
      response.data = result;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createUserOTP", this.traceFileName);
    }
  }

  public async getAPIAccessPermissions(commonRequest: CommonRequest, featureAttributeId: any) {
    this.logger.info(`getAPIAccessPermissions...start -> ${featureAttributeId}`);
    try {
      let data: any = {};
      const roles: any = (commonRequest.headers?.userRoles).toString();
      const appId: any = commonRequest.headers?.appId;
      const rbacBaseUrl: any = commonRequest.headers?.rbacBaseURL;
      const userId: any = (commonRequest.headers?.userId) ? commonRequest.headers?.userId : null;
      // Check Redis Cache
      const redisConn = await this.redis.getCacheConnection();
      let rbacPattern: any = REDIS_CACHE.RBAC.USER_HASH_NAME;
      rbacPattern = rbacPattern.replace("userId", String(userId));
      const rbacLength: any = await this.redis.hlen(redisConn, rbacPattern);

      if (rbacLength >= 1) {
        const userRbacKeys: any = await this.redis.hkeys(redisConn, rbacPattern);
        const validated: any = _.includes(userRbacKeys, featureAttributeId);
        const permission = await this.redis.hmget(redisConn, rbacPattern, featureAttributeId);
        const active: any = JSON.parse(permission);

        if (validated) {
          data = {
            "data": [{ "active": active }]
          };
        } else {
          data = {
            "data": [{ "active": 0 }]
          };
        }
        return data;
      } else {
        commonRequest.url = rbacBaseUrl + EXTERNAL_API.PR_RBAC_PERMISSIONS
          + `?appId=${appId}&roleIds=${roles}&attributeId=${featureAttributeId}`;
        try {
          const reponse: any = await externalAPIService.get(commonRequest);
          return reponse;
        } catch (error) {
          const err: any = error;
          if (!err && err.code !== 404) {
            throw applicationInsightsService.errorModel(error, "getAPIAccessPermissions", this.traceFileName);
          }
        }
      }
      return null;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getAPIAccessPermissions", this.traceFileName);
    }
  }

  public async getDataRbac(commonRequest: CommonRequest) {
    this.logger.info(`getDataRbac...start `);
    try {
      let userDataRbac: any = {};
      const rbacBaseUrl: any = commonRequest.headers?.rbacBaseURL;
      const userId: any = (commonRequest.headers?.userId) ? commonRequest.headers?.userId : null;
      // Check Redis Cache
      const redisConn = await this.redis.getCacheConnection();
      const dRbacPattern: any = REDIS_CACHE.DRBAC.USER_HASH_KEY;
      const dataRbacs = await this.redis.hmget(redisConn, dRbacPattern, userId);
      if (dataRbacs && Array.isArray(dataRbacs) && dataRbacs.length >= 1) {
        userDataRbac = JSON.parse(dataRbacs[0]);
        if (!userDataRbac) {
          commonRequest.url = rbacBaseUrl + EXTERNAL_API.PR_DATA_RBAC.replace(":userId", userId);
          try {
            const reponse: any = await externalAPIService.get(commonRequest);
            if (reponse && reponse.data) {
              return reponse.data;
            } else {
              return null;
            }
          } catch (error) {
            const err: any = error;
            if (!err && err.code !== 404) {
              throw applicationInsightsService.errorModel(error, "getDataRbac", this.traceFileName);
            }
          }
        }
      } else {
        return null
      }
      return userDataRbac;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataRbac", this.traceFileName);
    }
  }

  public async getPbacPermissions(commonRequest: CommonRequest) {
    this.logger.info("getPbacPermissions...start");
    try {
      let result: any = {};
      const userId: any = (commonRequest.headers?.userId) ? commonRequest.headers?.userId : null;
      // Check Redis Cache
      const redisConn = await this.redis.getCacheConnection();
      let pbacPattern: any = REDIS_CACHE.PBAC.USER_HASH_NAME;
      pbacPattern = pbacPattern.replace("userId", String(userId));
      const pbacLength: any = await this.redis.hlen(redisConn, pbacPattern);

      if (pbacLength >= 1) {
        const userPBAC: any[] = await this.redis.hkeys(redisConn, pbacPattern);
        result = await this.assembleRedisPbacResponse(commonRequest, pbacPattern, userPBAC, pbacLength);
      } else {
        result = await this.userDao.getPbacPermissions(commonRequest);
      }
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getPbacPermissions", this.traceFileName);
    }
  }

  public async getRbacRolePermissions(commonRequest: CommonRequest) {
    this.logger.info("getRbacRolePermissions...start");
    try {
      let result: any = {};
      result = await this.userDao.getRbacRolePermissions(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRbacRolePermissions", this.traceFileName);
    }
  }

  public async getRbacRolePositions(commonRequest: CommonRequest) {
    try {
      let result: any = {};
      result = await this.userDao.getRbacRolePositions(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getRbacRolePositions", this.traceFileName);
    }
  }

  private getPagination(page: number, size: string | number, defaultSize: number) {
    const limit: number = size ? +size : defaultSize;
    const offset: number = page ? page * limit : 0;
    return { limit, offset };
  }

  private async assembleRedisPbacResponse(commonRequest: CommonRequest, pbacPattern: string, userPBAC: any, pbacLength: number) {
    const query: any = commonRequest.query;
    const row: number = (!isNaN(query.row)) ? (query.row < 1) ? PBAC.DEFAULT.ROW : query.row : PBAC.DEFAULT.ROW;
    const page: number = (!isNaN(query.page)) ? (query.page >= 1) ? Number(query.page) - 1 : query.page : 0;

    let permissions: any[] = [];
    let nextCursor: number = 0;
    const since: number = Number(page);
    const limit: number = Number(row) + Number(since);
    let nextPageTarget: number | null = (Number(page) + Number(row)) + 1;

    const pData = this.getPagination(page, row, 10);

    const queryPermissions: any[] = [];
    const redisConn = await this.redis.getCacheConnection();
    const userPbacKeys: any = await this.redis.hkeys(redisConn, pbacPattern);
    const total = userPbacKeys && userPbacKeys.length > 0 ? userPbacKeys.length : 0;
    nextCursor = ((page + row) > total) ? total : (page + row);
    if (userPbacKeys && userPbacKeys.length > 0) {
      const pbacs: string[] = _.slice(userPbacKeys, pData.offset, (pData.limit * (page + 1)));
      if (pbacs.length > 0) {
        permissions = await this.redis.hmget(redisConn, pbacPattern, pbacs);
        permissions.forEach((permission) => {
          const parsedData: any = JSON.parse(permission);
          queryPermissions.push(parsedData);
        })
      } else {
      }
    } else {
    }

    const pbacPermissions: any = queryPermissions as PbacPermissionDto[];
    const totalDataCount: number = (pbacLength > 0) ? pbacLength : 0;
    const pbacPermissionsResponse: CommonResponseListDto<PbacPermissionDto> = {};

    if (nextPageTarget >= totalDataCount) {
      nextPageTarget = null;
    }

    const maxPage: number = Math.ceil(totalDataCount / row);
    const nextPage: number | null = (page + 2 > maxPage) ? null : page + 2;

    pbacPermissionsResponse.page = page + 1;
    pbacPermissionsResponse.nextPage = nextPage;
    pbacPermissionsResponse.row = Number(row);
    pbacPermissionsResponse.total = totalDataCount;
    pbacPermissionsResponse.transactionId = commonRequest.headers?.transactionId;
    pbacPermissionsResponse.message = "Successfully get list of pbac permissions";;
    pbacPermissionsResponse.data = pbacPermissions;
    return pbacPermissionsResponse;
  }
  // getApprovalLevelByApprovalTopicId
  public async getApprovalLevelByApprovalTopicId(commonRequest: CommonRequest) {
    this.logger.info("getApprovalLevelByApprovalTopicId...start");
    try {
      const result: any = await this.userDao.getApprovalLevelByApprovalTopicId(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getApprovalLevelByApprovalTopicId", this.traceFileName);
    }
  }
  public async creatUser(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] creatUser start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const body: any = {
        firstName: reqBody.payload.name.split(' ').slice(0, -1).join(' '),
        lastName: reqBody.payload.name.split(' ').slice(-1).join(' '),
        userName: reqBody.payload.email,

        email: reqBody.payload.email,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        version: 1,
        status: reqBody.status,
        transactionId: reqBody.transactionId,
        uniqueKey: uuidv4(),
        oid: uuidv4(),
        password: "",
        authenticationType: 1,
        failedLoginAttempt: 0,
        isSuspended: 0,


      };
      commonRequest.body = body;
      const result: any = await this.userDao.createUser(commonRequest);
      const response: CommonResponseListDto<any> = new CommonResponseListDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.CREATE_USER;
      response.data = result;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "createUser", this.traceFileName);
    }
  }

  public async updateStatusNewUser(commonRequest: CommonRequest) {
    try {
      this.logger.info(`[Service] updateStatusNewUser start..`);
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;
      const body: any = {
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
        status: reqBody.status
      };
      const params: any = {
        userId: reqBody.userId
      }
      commonRequest.body = body;
      commonRequest.params = params;
      const result: any = await this.userDao.updateStatusUser(commonRequest);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = String(commonRequest.headers.transactionId);
      response.message = SUCCESS.UPDATE_STATUS_USER;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "updateStatusUser", this.traceFileName);
    }
  }
  public async getUserByEmail(commonRequest: CommonRequest) {
    this.logger.info("getUserByEmail...start");
    try {
      const result: any = await this.userDao.getUserByEmail(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserByEmail", this.traceFileName);
    }
  }

  public async getUserDetail(commonRequest: CommonRequest) {
    this.logger.info("[getUserDetail]...start");
    try {
      const result: any = await this.userDao.getUserDetail(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getUserDetail", this.traceFileName);
    }
  }

  // softDeleteUserOtp
  public async softDeleteUserOtp(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteUserOtp]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteUserOtp(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_USER_OTP;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteUserOtp", this.traceFileName);
    }
  }

  public async softDeleteUser(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteUser]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteUser(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_USER;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteUserOtp", this.traceFileName);
    }
  }

  public async getDataUserById(commonRequest: CommonRequest) {
    this.logger.info("getDataUserById...start");
    try {
      const result: any = await this.userDao.getDataUserById(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataUserById", this.traceFileName);
    }
  }
  public async getDataUserRoleByUserId(commonRequest: CommonRequest) {
    this.logger.info("getDataUserRoleByUserId...start");
    try {
      const result: any = await this.userDao.getDataUserRoleByUserId(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataUserRoleByUserId", this.traceFileName);
    }
  }

  public async getDataUserRoleByRoleId(commonRequest: CommonRequest) {
    this.logger.info("getDataUserRoleByRoleId...start");
    try {
      const result: any = await this.userDao.getDataUserRoleByRoleId(commonRequest);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getDataUserRoleByRoleId", this.traceFileName);
    }
  }

  public async deletePermanentRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("[deletePermanentRolePosition]...start");
    try {
      const t: any = await sequelize.transaction();
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.deletePermanentRoleApproval(commonRequest, t);

      if (result && isArray(result) && result.length > 0) {
        const response: CommonResponseListDto<any> = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE_APPROVAL;
        response.data = result;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "deletePermanentRoleApproval", this.traceFileName);
    }
  }
  public async getLevelIdsByTopicIds(topiIds: any) {
    this.logger.info("getLevelIdsByTopicIds...start");
    try {
      const result: any = await this.userDao.getLevelIdsByTopicIds(topiIds);
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "getLevelIdsByTopicIds", this.traceFileName);
    }
  }

  public async softDeleteRole(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteRole]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteRole(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteRole", this.traceFileName);
    }
  }

  public async createUserFromDriver(commonRequest: CommonRequest) {
    this.logger.info("[createUserFromDriver]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const reqBody: any = commonRequest.body;
      const userId: any = commonRequest.headers?.userId;

      commonRequest.body = {
        firstName: reqBody.generalInformation.fullName.split(' ').slice(0, -1).join(' '),
        lastName: reqBody.generalInformation.fullName.split(' ').slice(-1).join(' '),
        userName: reqBody.professionalBackground.email,
        email: reqBody.professionalBackground.email,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        version: 1,
        status: reqBody.status,
        mobileNumber: reqBody.professionalBackground.phoneNumber,
        transactionId,
        uniqueKey: uuidv4(),
        oid: uuidv4(),
        password: null,
        authenticationType: 3,
        failedLoginAttempt: 0,
        isSuspended: 0,
        personalDataId: reqBody.personalDataId,
        personalId: reqBody.generalInformation.personalId
      };

      const result: any = await this.userDao.createUserFromDriver(commonRequest);

      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "createUserFromDriver", this.traceFileName);
    }
  }

  public async softDeleteRolePermission(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteRolePermission]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteRolePermission(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE_PERMISSION;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteRolePermission", this.traceFileName);
    }
  }

  public async softDeleteRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteRolePosition]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteRolePosition(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE_POSITION;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteRolePosition", this.traceFileName);
    }
  }

  public async softDeleteRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteRoleApproval]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteRoleApproval(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETE_ROLE_APPROVAL;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteRoleApproval", this.traceFileName);
    }
  }

  public async softDeleteUserRole(commonRequest: CommonRequest) {
    this.logger.info("[softDeleteUserRole]...start");
    try {
      const transactionId: any = commonRequest.headers?.transactionId;
      const result: any = await this.userDao.softDeleteUserRole(commonRequest);
      if (result) {
        const response: CommonResponseDto = {};
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.DELETED_USER_ROLE;
        return response;
      }
      return null;
    } catch (error) {
      const err: any = error;
      throw applicationInsightsService.errorModel(error, "softDeleteUserRole", this.traceFileName);
    }
  }




}
