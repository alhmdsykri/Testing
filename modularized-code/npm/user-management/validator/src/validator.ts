// @ts-ignore
import {
  applicationInsightsService,
  Logger,
  ErrorModel,
  ErrorWithDataModel,
} from "astrafms-services-error-logging";
import {
  CommonRequest,
  CommonResponseDto,
  CommonResponseListDto,
  RolePositionDto,
  RolePositionCompanyDto,
  RolePositionBusinessUnit,
  RolePositionBranchDto,
  RolePositionLocationDto,
  Payload,
  RoleApprovalDto,
} from "astrafms-common-dto-interface";
import { STATUS_CODE, VALIDATION } from "./constants/CONSTANTS.json";
import { SUCCESS, ERROR } from "./constants/MESSAGES.json";

export class RequestValidator {
  private logger: any = Logger.getLogger("./validator.ts");
  private trace: any;
  private traceFileName: any;

  // const commonRequest: CommonRequest = new CommonRequest();

  public async validateCreateRole(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateCreateRole...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const validateName: any = await userService.getRoleByName(commonRequest);
      const checkRegex: any = /^[ A-Za-z0-9_@./!@#$%^&*(),?"':{}|`~=+-]*$/;
      const name: any = commonRequest.body.name;
      const isSuperAdmin: boolean | null = commonRequest.body.isSuperAdmin;
      const permissions: any = commonRequest.body.permissions;
      const maxLength: number = 60;
      const userId: any = Number(commonRequest.headers?.userId);
      const tempPermissionId: any = [];
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (isNaN(userId)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      }
      if (!commonRequest.headers?.userId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID,
          transactionId
        );
      } else {
        if (!name)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MISSING_KEY_NAME,
            transactionId
          );
        if (!permissions)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MISSING_KEY_PERMISSIONS,
            transactionId
          );
        if (validateName)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.ALREADY_EXIST,
            transactionId
          );
        if (!name.match(checkRegex))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.REGEX,
            transactionId
          );
        if (name.length > maxLength)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MAX_CHAR,
            transactionId
          );

        // isSuperAdmin data type validation
        if (isSuperAdmin && typeof isSuperAdmin !== "boolean") {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.ROLE_IS_SUPER_ADMIN,
            transactionId
          );
        }

        let counter: number = 0;
        for (const permission of permissions) {
          if (tempPermissionId.includes(permission.permissionId)) {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              ERROR.ROLE.DUPLICATING_PERMISSIONID,
              transactionId
            );
          }
          if (permission.permissionId) {
            if (typeof permission.permissionId !== "number") {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.ROLE.PERMISSION_ID,
                transactionId
              );
            }
            if (
              typeof permission.v !== "number" ||
              typeof permission.e !== "number" ||
              typeof permission.a !== "number"
            ) {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.ROLE.PERMISSION_VALUE,
                transactionId
              );
            } else if (
              permission.v > 1 ||
              permission.e > 1 ||
              permission.a > 1
            ) {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.ROLE.PERMISSION_VALUE,
                transactionId
              );
            }
          } else {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.ROLE.MISSING_PERMISSION_ID} - index ${counter}`,
              transactionId
            );
          }
          tempPermissionId.push(permission.permissionId);
          counter++;
        }
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateCreateRole",
        this.traceFileName
      );
    }
  }

  public async validateUpdateRole(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateUpdateRole...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const isSuperAdmin: boolean | null = commonRequest.body.isSuperAdmin;
    try {
      // const validateName = await userService.getRoleByName(commonRequest);
      // const validateId = await userService.getRoleById(commonRequest);
      const [validateName, validateId] = await Promise.all([
        await userService.getRoleByName(commonRequest),
        await userService.getRoleById(commonRequest),
      ]);
      const checkRegex: any = /^[ A-Za-z0-9_@./!@#$%^&*(),?"':{}|`~=+-]*$/;
      const name: any = commonRequest.body.name;
      const permissions: any = commonRequest.body.permissions;
      const maxLength: number = 60;
      const userId: any = Number(commonRequest.headers?.userId);
      const tempPermissionId: any = [];
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (isNaN(userId)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      }
      if (!commonRequest.headers?.userId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID,
          transactionId
        );
      } else {
        if (!name)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MISSING_KEY_NAME,
            transactionId
          );
        if (!permissions)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MISSING_KEY_PERMISSIONS,
            transactionId
          );
        if (!validateId)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            ERROR.ROLE.MISSING_ROLEID,
            transactionId
          );
        if (validateName && validateName.roleId !== validateId.roleId)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.ALREADY_EXIST,
            transactionId
          );
        if (!name.match(checkRegex))
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.REGEX,
            transactionId
          );
        if (name.length > maxLength)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MAX_CHAR,
            transactionId
          );

        // isSuperAdmin data type validation
        if (isSuperAdmin && typeof isSuperAdmin !== "boolean") {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.ROLE_IS_SUPER_ADMIN,
            transactionId
          );
        }

        let counter: number = 0;
        for (const permission of permissions) {
          if (tempPermissionId.includes(permission.permissionId)) {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              ERROR.ROLE.DUPLICATING_PERMISSIONID,
              transactionId
            );
          }
          if (permission.permissionId) {
            if (typeof permission.permissionId !== "number") {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.ROLE.PERMISSION_ID,
                transactionId
              );
            }
            if (
              typeof permission.v !== "number" ||
              typeof permission.e !== "number" ||
              typeof permission.a !== "number"
            ) {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.ROLE.PERMISSION_VALUE,
                transactionId
              );
            } else if (
              permission.v > 1 ||
              permission.e > 1 ||
              permission.a > 1
            ) {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                ERROR.ROLE.PERMISSION_VALUE,
                transactionId
              );
            }
          } else {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.ROLE.MISSING_PERMISSION_ID} - index ${counter}`,
              transactionId
            );
          }
          tempPermissionId.push(permission.permissionId);
          counter++;
        }
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateUpdateRole",
        this.traceFileName
      );
    }
  }

  public async validateGetRoles(commonRequest: CommonRequest) {
    this.logger.info("validateGetRoles...start");
    console.log("@Body ==> ", commonRequest.body);
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers.transactionId) {
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
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateGetRoles",
        this.traceFileName
      );
    }
  }

  public async validateGetRole(commonRequest: CommonRequest, userService: any) {
    this.logger.info("validateGetRole...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const validateId = await userService.getRoleById(commonRequest);
      if (!validateId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
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
        "validateGetRole",
        this.traceFileName
      );
    }
  }

  public async validateGetRolePermission(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetRolePermission...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const validateId = await userService.getRoleById(commonRequest);
      if (!validateId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
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
        "validateGetRolePermission",
        this.traceFileName
      );
    }
  }

  public async validateGetRolePosition(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetRolePosition...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const validateId = await userService.getRoleById(commonRequest);
      if (!validateId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
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
        "validateGetRolePosition",
        this.traceFileName
      );
    }
  }

  public async validateGetRolePositionDetails(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetRolePositionDetails...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const validateId = await userService.getRoleById(commonRequest);
      if (!validateId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
          transactionId
        );
      }
      if (commonRequest.query.companyId) {
        if (
          typeof Number(commonRequest.query.companyId) !== "number" ||
          isNaN(Number(commonRequest.query.companyId))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MUST_BE_NUMBER_COMPANY_ID,
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
        "validateGetRolePositionDetails",
        this.traceFileName
      );
    }
  }

  public async validateGetAuthorization(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetAuthorization...start");
    const transactionId: string = commonRequest.headers?.transactionId;
    const userRoles: any = commonRequest.headers?.userRoles;
    const userId: string = commonRequest.headers?.userId;
    try {
      if (!Array.isArray(userRoles)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.FORBIDDEN,
          ERROR.ROLE.USER_MUST_HAVE_ROLE,
          transactionId
        );
      }
      if (Array.isArray(userRoles) && userRoles.length <= 0) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.FORBIDDEN,
          ERROR.ROLE.USER_MUST_HAVE_ROLE,
          transactionId
        );
      }
      console.log("@@ userRoles --> ", userRoles);
      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = [];
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateGetAuthorization",
        this.traceFileName
      );
    }
  }

  public async validateGetRbacRolePermissions(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetAuthorization...start");
    const transactionId: string = commonRequest.headers?.transactionId;
    const roleIds: any = commonRequest.query?.roleIds;
    const userId: string = commonRequest.headers?.userId;
    const response: CommonResponseListDto<any> = {};
    try {
      if (!userId && !Array.isArray(roleIds)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ROLE.USER_MUST_HAVE_ROLE,
          transactionId
        );
      }
      if (Array.isArray(roleIds) && roleIds.length <= 0) {
        if (!userId) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.USER_MUST_HAVE_ROLE,
            transactionId
          );
        } else {
          // get roles via userId
          const userRoleData: any = await userService.getUserRoles(
            commonRequest
          );
          if (userRoleData && userRoleData?.userRoles) {
            response.code = STATUS_CODE.SUCCESS.OK;
            response.transactionId = transactionId;
            response.message = SUCCESS.VALIDATE;
            response.data = [
              {
                roleIds: userRoleData.userRoles,
              },
            ];
            return response;
          } else {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              ERROR.ROLE.USER_MUST_HAVE_ROLE,
              transactionId
            );
          }
        }
      } else {
        // get roles from params roleIds
      }
      if (commonRequest.query.appId) {
        if (
          typeof Number(commonRequest.query.appId) !== "number" ||
          isNaN(Number(commonRequest.query.appId))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.RESOURCE.APPID_MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query.row) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.RESOURCE.APPID_MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      } else {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.APPID_REQUIRED,
          transactionId
        );
      }

      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = [];
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateGetRbacRolePermissions",
        this.traceFileName
      );
    }
  }

  public async validateGetRbacRolePositions(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetRbacRolePositions...start");
    console.log("@Body ==> ", commonRequest.body);
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (
        typeof Number(commonRequest.body.userId) !== "number" ||
        isNaN(Number(commonRequest.body.userId))
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.USERID_MUST_BE_NUMBER,
          transactionId
        );
      }
      const validateUserId =
        await userService.getUserByEmailOrUserNameOrPersonalId(commonRequest);
      console.log("@@@@ validateUserId ->> ", validateUserId);
      if (validateUserId && !validateUserId.data) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.USER.USER_NOT_FOUND,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateGetRbacRolePositions",
        this.traceFileName
      );
    }
  }

  public async validateLoginAuthentication(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetAuthorization...start");
    const userData: any[] = [];
    const transactionId: string = commonRequest.headers?.transactionId;
    const type: any = commonRequest.body.type;
    const email: any = commonRequest.body.email;
    const password: any = commonRequest.body.password;
    try {
      if (type) {
        if (typeof Number(type) !== "number" || isNaN(Number(type))) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.USER_LOGIN.TYPE_INT,
            transactionId
          );
        }
      } else {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN.MISSING_TYPE,
          transactionId
        );
      }

      if (!email) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN.MISSING_EMAIL,
          transactionId
        );
      }
      if (!password) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN.MISSING_PASSWORD,
          transactionId
        );
      }

      const user: any = await userService.getUserByEmailOrUserNameOrPersonalId(
        commonRequest
      );
      if (!user?.data) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.USER_LOGIN.USER_NOT_FOUND,
          transactionId
        );
      } else {
        // Check if user is suspended
        const data: any = user.data;
        const isSuspended: any = data?.isSuspended;
        // const failedLoginAttempt: any = data?.failedLoginAttempt;
        if (isSuspended) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
            ERROR.USER_LOGIN.USER_SUSPENDED,
            transactionId
          );
        }
        userData.push(user.data);
      }

      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = userData;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateLoginAuthentication",
        this.traceFileName
      );
    }
  }

  public async validateLoginAuthenticationPersonalId(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateLoginAuthenticationPersonalId...start");
    const userData: any[] = [];
    const transactionId: string = commonRequest.headers?.transactionId;
    const type: any = commonRequest.body.type;
    const personalId: any = commonRequest.body.personalId;
    try {
      if (type) {
        if (typeof Number(type) !== "number" || isNaN(Number(type))) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.USER_LOGIN_PERSONAL_ID.TYPE_INT,
            transactionId
          );
        }
      } else {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.MISSING_TYPE,
          transactionId
        );
      }

      if (!personalId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.MISSING_PERSONAL_ID,
          transactionId
        );
      } else if (typeof personalId !== "string") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.TYPE_STRING,
          transactionId
        );
      } else if (
        personalId &&
        personalId.length !== VALIDATION.PERSONAL_ID_LENGTH
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.PERSONAL_ID_LENGTH,
          transactionId
        );
      }

      const user: any = await userService.getUserByEmailOrUserNameOrPersonalId(
        commonRequest
      );
      if (!user?.data) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
          ERROR.USER_LOGIN_PERSONAL_ID.USER_PERSONAL_ID_NOT_FOUND,
          transactionId
        );
      } else {
        // Check if user is suspended
        const data: any = user.data;
        const isSuspended: any = data?.isSuspended;
        if (isSuspended) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
            ERROR.USER_LOGIN.USER_SUSPENDED,
            transactionId
          );
        }
        userData.push(user.data);
      }

      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = userData;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateLoginAuthenticationPersonalId",
        this.traceFileName
      );
    }
  }

  public async validateLoginAuthenticationPersonalIdOTP(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateLoginAuthenticationPersonalIdOTP...start");
    const userData: any[] = [];
    const userOTPData: any[] = [];
    const transactionId: string = commonRequest.headers?.transactionId;
    const type: any = commonRequest.body.type;
    const personalId: any = commonRequest.body.personalId;
    const otp: any = commonRequest.body.otp;
    try {
      if (type) {
        if (typeof Number(type) !== "number" || isNaN(Number(type))) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.USER_LOGIN_PERSONAL_ID.TYPE_INT,
            transactionId
          );
        }
      } else {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.MISSING_TYPE,
          transactionId
        );
      }

      if (!personalId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.MISSING_PERSONAL_ID,
          transactionId
        );
      } else if (typeof personalId !== "string") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.TYPE_STRING,
          transactionId
        );
      } else if (
        personalId &&
        personalId.length !== VALIDATION.PERSONAL_ID_LENGTH
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.PERSONAL_ID_LENGTH,
          transactionId
        );
      }

      if (!otp) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER_LOGIN_PERSONAL_ID.MISSING_OTP,
          transactionId
        );
      }

      const user: any = await userService.getUserByEmailOrUserNameOrPersonalId(
        commonRequest
      );
      if (!user?.data) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
          ERROR.USER_LOGIN_PERSONAL_ID.USER_PERSONAL_ID_NOT_FOUND,
          transactionId
        );
      } else {
        // Check if user is suspended
        const data: any = user.data;
        const isSuspended: any = data?.isSuspended;
        if (isSuspended) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
            ERROR.USER_LOGIN.USER_SUSPENDED,
            transactionId
          );
        }
        commonRequest.params = {
          userId: data.userId,
        };

        const userOTP: any = await userService.getUserPersonalIdOTP(
          commonRequest
        );
        if (!userOTP?.data) {
          const userLoginStatus: any = await userService.updateLoginStatus(
            commonRequest
          );
          if (userLoginStatus.data?.isSuspended) {
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
              ERROR.USER_LOGIN.USER_SUSPENDED,
              transactionId
            );
          }
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.UNAUTHORIZED,
            ERROR.USER_LOGIN_PERSONAL_ID.MISSING_OTP_NOT_FOUND,
            transactionId
          );
        }
        const retPayLoad: any = {
          ...userOTP.data,
          userId: data.userId,
          personalDataId: data.personalDataId,
        };
        userOTPData.push(retPayLoad);
      }

      const response: CommonResponseListDto<any> = {};
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = userOTPData;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateLoginAuthenticationPersonalIdOTP",
        this.traceFileName
      );
    }
  }

  public async validateCreateRolePositions(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateCreateRolePositions...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const [validateRoleId] = await Promise.all([
        await userService.getRoleById(commonRequest),
      ]);
      console.log("@@ validateRoleId -->> ", validateRoleId);

      const userId: any = Number(commonRequest.headers?.userId);
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (isNaN(userId)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      }
      if (!validateRoleId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.INVALID_ROLEID,
          transactionId
        );
      }
      if (!commonRequest.headers?.userId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID,
          transactionId
        );
      } else {
        console.log("-=-=-=-=- validating inputs =-=-=-=-=");
        const payload: any = commonRequest.body;
        const companies: RolePositionCompanyDto[] = payload.companies;
        console.log("@@ companies --> ", companies);

        // Iterate companies
        if (!Array.isArray(companies)) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.ROLE_POSITIONS.MISSING_COMPANY}`,
            transactionId
          );
        } else if (companies.length === 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.ROLE_POSITIONS.MISSING_COMPANY}`,
            transactionId
          );
        }
        companies.forEach(
          (company: RolePositionCompanyDto, indexCompany: any) => {
            // Iterate Business Unit per company
            if (!company.companyId || isNaN(company.companyId)) {
              throw new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${indexCompany} - ${ERROR.ROLE_POSITIONS.MISSING_COMPANY_ID}`,
                transactionId
              );
            }
            if (!company.code) {
              throw new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${indexCompany} - ${ERROR.ROLE_POSITIONS.MISSING_COMPANY_CODE}`,
                transactionId
              );
            }
            if (!company.name) {
              throw new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${indexCompany} - ${ERROR.ROLE_POSITIONS.MISSING_COMPANY_NAME}`,
                transactionId
              );
            }
            if (!Array.isArray(company.businessUnits)) {
              throw new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${indexCompany} - ${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BUSINESS_UNIT}`,
                transactionId
              );
            } else if (company.businessUnits.length === 0) {
              throw new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${indexCompany} - ${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BUSINESS_UNIT}`,
                transactionId
              );
            }
            const businessUnits: RolePositionBusinessUnit[] =
              company.businessUnits;
            businessUnits.forEach(
              (businessUnit: RolePositionBusinessUnit, indexBU: any) => {
                // Iterate Branch per Business Unit
                if (
                  !businessUnit.businessUnitId ||
                  isNaN(businessUnit.businessUnitId)
                ) {
                  throw new ErrorModel(
                    STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                    `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BUSINESS_ID} - ${indexBU}`,
                    transactionId
                  );
                }
                if (!businessUnit.code) {
                  throw new ErrorModel(
                    STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                    `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BUSINESS_CODE} - ${indexBU}`,
                    transactionId
                  );
                }
                if (!businessUnit.name) {
                  throw new ErrorModel(
                    STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                    `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BUSINESS_NAME} - ${indexBU}`,
                    transactionId
                  );
                }
                if (!Array.isArray(businessUnit.branches)) {
                  throw new ErrorModel(
                    STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                    `${indexCompany} - ${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BRANCH}`,
                    transactionId
                  );
                } else if (businessUnit.branches.length === 0) {
                  throw new ErrorModel(
                    STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                    `${indexCompany} - ${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BRANCH}`,
                    transactionId
                  );
                }
                const branches: RolePositionBranchDto[] =
                  businessUnit?.branches;
                branches.forEach(
                  (branch: RolePositionBranchDto, indexBranch: any) => {
                    // Iterate Locations per Branch
                    if (!branch.branchId || isNaN(branch.branchId)) {
                      throw new ErrorModel(
                        STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                        `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BRANCH_ID} - ${indexBranch}`,
                        transactionId
                      );
                    }
                    if (!branch.code) {
                      throw new ErrorModel(
                        STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                        `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BRANCH_CODE} - ${indexBranch}`,
                        transactionId
                      );
                    }
                    if (!branch.name) {
                      throw new ErrorModel(
                        STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                        `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_BRANCH_NAME} - ${indexBranch}`,
                        transactionId
                      );
                    }
                    if (!Array.isArray(branch.locations)) {
                      throw new ErrorModel(
                        STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                        `${indexCompany} - ${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_LOCATION}`,
                        transactionId
                      );
                    } else if (branch.locations.length === 0) {
                      throw new ErrorModel(
                        STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                        `${indexCompany} - ${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_LOCATION}`,
                        transactionId
                      );
                    }

                    // Iterate Location per Branch
                    const locations: RolePositionLocationDto[] =
                      branch?.locations;
                    locations.forEach(
                      (location: RolePositionLocationDto, indexLoc) => {
                        if (
                          !location.locationId ||
                          isNaN(location.locationId)
                        ) {
                          throw new ErrorModel(
                            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                            `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_LOCATION_ID} - ${indexLoc}`,
                            transactionId
                          );
                        }
                        if (!location.code) {
                          throw new ErrorModel(
                            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                            `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_LOCATION_CODE} - ${indexLoc}`,
                            transactionId
                          );
                        }
                        if (!location.name) {
                          throw new ErrorModel(
                            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                            `${company.name} - ${ERROR.ROLE_POSITIONS.MISSING_LOCATION_NAME} - ${indexLoc}`,
                            transactionId
                          );
                        }
                      }
                    ); // for locations
                  }
                ); // for branches
              }
            ); // for business units
          }
        ); // for companies
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateCreateRolePositions",
        this.traceFileName
      );
    }
  }

  public async validateHeaders(commonRequest: CommonRequest) {
    this.logger.info("validateHeaders...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers.transactionId) {
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

  public async validatePathParams(commonRequest: CommonRequest) {
    this.logger.info("validatePathParams...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (
        commonRequest.params.roleId === null ||
        typeof Number(commonRequest.params.roleId) !== "number" ||
        isNaN(Number(commonRequest.params.roleId))
      ) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
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
        "validatePathParams",
        this.traceFileName
      );
    }
  }

  public async validateQueryParams(commonRequest: CommonRequest) {
    this.logger.info("validateQueryParams start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (commonRequest.query.row) {
        if (
          typeof Number(commonRequest.query.row) !== "number" ||
          isNaN(Number(commonRequest.query.row))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query.row) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.ROW.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
      if (commonRequest.query.page) {
        if (
          typeof Number(commonRequest.query.page) !== "number" ||
          isNaN(Number(commonRequest.query.page))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.PAGINATION.PAGE.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query.page) <= 0) {
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
        "validateQueryParams",
        this.traceFileName
      );
    }
  }

  public async validateGetRoleApproval(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetRoleApproval...start");
    console.log("query param ==> ", commonRequest.params.roleId);
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (!commonRequest.params.roleId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ROLE.INVALID_ROLEID,
          transactionId
        );
      }
      try {
        const validateRoleApprovalId = await userService.getRoleById(
          commonRequest
        );
        if (!commonRequest.headers.transactionId) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.RESOURCE.TRANSACTIONID,
            transactionId
          );
        }
        if (!validateRoleApprovalId)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            ERROR.ROLE.MISSING_APPROVAL_ROLE_ID,
            transactionId
          );
        const response: CommonResponseDto = new CommonResponseDto();
        response.code = STATUS_CODE.SUCCESS.OK;
        response.transactionId = transactionId;
        response.message = SUCCESS.VALIDATE;
        return response;
      } catch (error) {
        console.log("@@ error -->> ", error);
        throw applicationInsightsService.errorModel(
          error,
          "validateGetRoleApproval",
          this.traceFileName
        );
      }
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateGetRoleApproval",
        this.traceFileName
      );
    }
  }

  public async validateCreateRoleApprovals(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateCreateRoleApprovals...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const roleId: string = commonRequest.params?.roleId;
    const approvals: any = commonRequest.body.payload.roleApprovals;
    const tempApprovalTopics: any = [];
    const tempApprovalLevels: any = [];
    const tempCommonRequest: CommonRequest = new CommonRequest();
    tempCommonRequest.params = {
      roleId,
    };
    try {
      const validateRoleId = await userService.getRoleById(commonRequest);
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      } else {
        if (!approvals || approvals.length < 1)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MISSING_KEY_APPROVALS,
            transactionId
          );
        if (!validateRoleId)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            ERROR.ROLE.MISSING_ROLEID,
            transactionId
          );
        // max 3
        console.log("approval before   ==>", approvals);
        if (approvals.length > 3)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE_APPROVAL.MAX_ROLE_APPROVAL,
            transactionId
          );
        let index = 0;
        const tempWrongApprovalTopicId = [];
        const tempWrongApprovalLevelId = [];
        const tempWrongisSegatedDuty = [];

        for (const approval of approvals) {
          tempCommonRequest.body = approval;
          // undifined
          if (
            approval.approvalTopicId === undefined ||
            !approval.approvalTopicId ||
            approval.approvalTopicId.length === 0
          ) {
            tempWrongApprovalTopicId.push(index);
          }
          if (
            approval.approvalLevelId === undefined ||
            !approval.approvalLevelId ||
            approval.approvalLevelId.length === 0
          ) {
            tempWrongApprovalLevelId.push(index);
          }
          if (
            approval.isSegatedDuty === undefined ||
            approval.isSegatedDuty.length === 0
          ) {
            tempWrongisSegatedDuty.push(index);
          }
          if (approval.approvalTopicId) {
            if (typeof approval.approvalTopicId !== "number") {
              console.log("app=====>", approvals);
              tempWrongApprovalTopicId.push(index);
            }
          }
          if (typeof approval.approvalLevelId !== "number") {
            tempWrongApprovalLevelId.push(index);
          }
          if (approval.isSegatedDuty > 1 || approval.isSegatedDuty < 0) {
            if (typeof approval.isSegatedDuty !== "boolean") {
              tempWrongisSegatedDuty.push(index);
            }
          }
          index++;
          tempApprovalTopics.push(approval.approvalTopicId);
          tempApprovalLevels.push(approval.approvalLevelId);
        }
        if (tempWrongApprovalTopicId.length > 0) {
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.TYPE_APPROVAL_ID,
            transactionId,
            tempWrongApprovalTopicId
          );
        }
        if (tempWrongApprovalLevelId.length > 0) {
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.TYPE_APPROVAL_LEVEL_ID,
            transactionId,
            approvals.tempWrongApprovalLevelId
          );
        }
        if (tempWrongisSegatedDuty.length > 0) {
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.TYPE_APPROVAL_SEGATED_OF_DUTY,
            transactionId,
            approvals.indexOf(tempWrongisSegatedDuty)
          );
        }
        const topicDuplicated = await this.findDuplicateTopic(approvals);
        if (topicDuplicated.length > 0)
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.DUPLICATING_APPROVAL_TOPIC_ID,
            transactionId,
            topicDuplicated
          );
        const levelDuplicated = await this.findDuplicateLevel(approvals);
        if (levelDuplicated.length > 0)
          return new ErrorWithDataModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.DUPLICATING_LEVELID,
            transactionId,
            levelDuplicated
          );

        // topics
        const ApprovalTopicRes = await userService.getDataTopicByTopicIds(
          tempApprovalTopics
        );
        const resDbTopic = ApprovalTopicRes.ApprovalTopics;
        if (resDbTopic.length > 0) {
          const resDbTopicFiltered = [];
          for (const resDbTopicElement of resDbTopic) {
            resDbTopicFiltered.push(resDbTopicElement.approvalTopicId);
          }
          console.log("req compare", resDbTopicFiltered);
          const indexTopicRes = await this.compareArrValue(
            tempApprovalTopics,
            resDbTopicFiltered
          );
          if (indexTopicRes.length > 0) {
            return new ErrorWithDataModel(
              STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
              ERROR.ROLE.TOPIC_ID_NOT_IN_DB,
              transactionId,
              indexTopicRes
            );
          }
        }

        const ApprovalLevelIdRes = await userService.getLevelIdsByTopicIds(
          tempApprovalTopics
        );
        const resDbLevel = ApprovalLevelIdRes.ApprovalLevels;
        if (resDbLevel.length > 0) {
          const resDbLevelFiltered = [];
          for (const resDbLevelElement of resDbLevel) {
            resDbLevelFiltered.push(resDbLevelElement.approvalLevelId);
          }
          const indexTopicRes = await this.compareArrValue(
            tempApprovalLevels,
            resDbLevelFiltered
          );
          if (indexTopicRes.length > 0) {
            return new ErrorWithDataModel(
              STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
              ERROR.ROLE.LEVEL_ID_NOT_IN_DB,
              transactionId,
              indexTopicRes
            );
          }
        }
        // get approval levels by topic ids
        // const ApprovalLevelIdRes = await userService.getLevelIdsByTopicIds(tempApprovalTopics);
        // // compareArrValue
        // const indexLevelRes = await this.compareArrValue(tempApprovalLevels,ApprovalLevelIdRes);

        // if ( indexLevelRes.length >0) {
        //   console.log("indexLevelRes",indexLevelRes)
        //  return new ErrorWithDataModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, ERROR.ROLE.INVALID_LEVEL_ID, transactionId,indexLevelRes);
        // }
      }

      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateCreateRoleApprovals",
        this.traceFileName
      );
    }
  }

  public async validateDeleteRoleApproval(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateDeleteRoleApproval...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const roleApprovalId: number = Number(commonRequest.params.roleApprovalId);
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (typeof roleApprovalId !== "number" || isNaN(roleApprovalId)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ROLE_APPROVAL.MUST_BE_NUMBER,
          transactionId
        );
      }
      const [validateRoleApprovalId, validateIsDeleted] = await Promise.all([
        await userService.getRoleApprovalById(commonRequest),
        await userService.deleteRoleApprovalById(commonRequest),
      ]);
      if (!validateRoleApprovalId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_APPROVAL_ROLE_ID,
          transactionId
        );
      if (validateIsDeleted) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE_APPROVAL.IS_DELETED,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateDeleteRoleApproval",
        this.traceFileName
      );
    }
  }

  public async validateRoleId(commonRequest: CommonRequest, userService: any) {
    this.logger.info(
      "validateRoleId...start role id ",
      commonRequest.params.roleId
    );
    console.log("query param ==> ", commonRequest.params.roleId);
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.params.roleId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ROLE.INVALID_ROLEID,
          transactionId
        );
      }
      if (
        typeof Number(commonRequest.params.roleId) !== "number" ||
        isNaN(Number(commonRequest.params.roleId))
      ) {
        console.log(
          "invalid  role id ------------>",
          commonRequest.params.roleId
        );
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
          transactionId
        );
      }
      const [validateRoleId] = await Promise.all([
        await userService.getRoleById(commonRequest),
      ]);
      console.log("@@ validateRoleId -->> ", validateRoleId);

      if (!validateRoleId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.INVALID_ROLEID,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateRoleId",
        this.traceFileName
      );
    }
  }

  public async validateQueryApprovalTopicId(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info(
      "validateQueryApprovalTopicId start validateQueryApprovalTopicId ===> @@ query:",
      commonRequest.query
    );
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (
        !commonRequest.query.approvalTopicId ||
        commonRequest.query.approvalTopicId.length <= 0
      ) {
        console.log(
          "ApprovalTopicId====>",
          commonRequest.query.approvalTopicId
        );
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.APPROVAL_LEVEL["APPROVAL TOPIC_ID_EMPTY"],
          transactionId
        );
      }
      if (commonRequest.query.approvalTopicId) {
        if (
          typeof Number(commonRequest.query.page) !== "number" ||
          isNaN(Number(commonRequest.query.approvalTopicId))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.APPROVAL_LEVEL.MUST_BE_NUMBER,
            transactionId
          );
        }
        if (Number(commonRequest.query.approvalTopicId) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.APPROVAL_LEVEL.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
        const validateApprovalTopicId =
          await userService.getApprovalLevelByApprovalTopicId(commonRequest);
        if (!validateApprovalTopicId) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            ERROR.APPROVAL_LEVEL.INVALID_APPROVALTOPIC_ID,
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
        "validateQueryApprovalTopicId",
        this.traceFileName
      );
    }
  }

  public async validateUpdateUser(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateUpdateUser...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const roles: any = commonRequest.body.roles;
      const email: any = commonRequest.body.email;
      const name: any = commonRequest.body.name;
      const userId: any = Number(commonRequest.headers?.userId);
      const userIdReq: any = Number(commonRequest.params?.userId);
      const tempRoleId: any = [];
      const checkRegex: any = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const maxLength: number = 50;
      if (!commonRequest.headers?.userId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          `${ERROR.RESOURCE.USERID}`,
          transactionId
        );
      if (!commonRequest.params?.userId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.RESOURCE.USERID}`,
          transactionId
        );
      if (!commonRequest.body?.name)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MISSING_NAME,
          transactionId
        );
      if (!commonRequest.body?.email)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MISSING_EMAIL,
          transactionId
        );
      if (!String(email).match(checkRegex))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.EMAIL_REGEX,
          transactionId
        );
      if (!commonRequest.headers.transactionId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      if (isNaN(userId))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      if (!roles)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MISSING_ROLES,
          transactionId
        );
      if (name.length > maxLength)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MAX_CHAR,
          transactionId
        );
      if (typeof name !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.NAME_FORMAT,
          transactionId
        );
      if (roles.length > 5)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MAX_ROLES,
          transactionId
        );
      else {
        for (const role of roles) {
          if (tempRoleId.includes(role))
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.USER.DUPLICATING_ROLEID} (${role})`,
              transactionId
            );
          if (role) {
            if (typeof role !== "number") {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${ERROR.USER.MUST_BE_NUMBER_ROLEID} (${role})`,
                transactionId
              );
            }
          }
          tempRoleId.push(role);
        }
        const [validateUser, validateRoles, validateEmail] = await Promise.all([
          await userService.getUserById(commonRequest),
          await userService.getRolesInIds(commonRequest),
          await userService.getUserByEmail(commonRequest),
        ]);
        const roleIdsReq: any[] = commonRequest.body.roles;
        const roleIdsRes: any[] = validateRoles.data.map(
          (role: any) => role.roleId
        );
        const compareRoleId = roleIdsReq.filter(
          (roleId) => !roleIdsRes.includes(roleId)
        );
        if (compareRoleId.length > 0)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.USER.MISSING_ROLEID} (${compareRoleId.join(", ")})`,
            transactionId
          );
        if (!validateUser)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
            `${ERROR.USER.NOT_FOUND} ${userIdReq}`,
            transactionId
          );
        if (validateEmail !== null) {
          if (
            String(validateEmail.email) !==
              String(commonRequest.body.emailOld) ||
            Number(validateEmail.userId) !== Number(commonRequest.params.userId)
          )
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              ERROR.NEW_USER.ALREADY_EXIST,
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
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateUpdateUser",
        this.traceFileName
      );
    }
  }

  public async validateCreateUser(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateCreateUser...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const roles: any = commonRequest.body.roles;
      const email: any = commonRequest.body.email;
      const name: any = commonRequest.body.name;
      commonRequest.body.email = email;
      const userId: any = Number(commonRequest.headers?.userId);
      const tempRoleId: any = [];
      const maxLength: number = 60;
      const checkFormatEmail: any = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (!commonRequest.headers.transactionId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      if (isNaN(userId))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      if (!commonRequest.headers?.userId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          `${ERROR.RESOURCE.USERID}`,
          transactionId
        );
      if (!commonRequest.body?.name)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MISSING_NAME,
          transactionId
        );
      if (!commonRequest.body?.email)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MISSING_EMAIL,
          transactionId
        );
      if (!roles)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MISSING_ROLES,
          transactionId
        );
      if (name.length > maxLength)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MAX_CHAR,
          transactionId
        );
      if (typeof name !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.NAME_FORMAT,
          transactionId
        );
      if (typeof email !== "string")
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.EMAIL_REGEX,
          transactionId
        );
      if (!email.match(checkFormatEmail))
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.EMAIL_REGEX,
          transactionId
        );
      if (roles.length > 5)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.MAX_ROLES,
          transactionId
        );
      else {
        for (const role of roles) {
          if (tempRoleId.includes(role))
            return new ErrorModel(
              STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
              `${ERROR.USER.DUPLICATING_ROLEID} (${role})`,
              transactionId
            );
          if (role) {
            if (typeof role !== "number") {
              return new ErrorModel(
                STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
                `${ERROR.USER.MUST_BE_NUMBER_ROLEID} (${role})`,
                transactionId
              );
            }
          }
          tempRoleId.push(role);
        }
        const [validateRoles] = await Promise.all([
          await userService.getRolesInIds(commonRequest),
        ]);
        const roleIdsReq: any[] = commonRequest.body.roles;
        const roleIdsRes: any[] = validateRoles.data.map(
          (role: any) => role.roleId
        );
        const compareRoleId = roleIdsReq.filter(
          (roleId) => !roleIdsRes.includes(roleId)
        );
        if (compareRoleId.length > 0)
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            `${ERROR.USER.MISSING_ROLEID} (${compareRoleId.join(", ")})`,
            transactionId
          );
      }
      const validateEmail = await userService.getUserByEmail(commonRequest);
      console.log("validateEmail=====>", validateEmail);
      if (validateEmail !== null) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.NEW_USER.ALREADY_EXIST,
          transactionId
        );
      }
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateUpdateUser",
        this.traceFileName
      );
    }
  }

  public async validateEmailAD(
    commonRequest: CommonRequest,
    userAuthService: any
  ) {
    this.logger.info(
      "validateEmailAD...start emaila: ",
      commonRequest.body.email
    );
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (!commonRequest.body.email) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.NEW_USER.EMAIL_NULL,
          transactionId
        );
      }
      const [validateEmail] = await Promise.all([
        await userAuthService.validateEmaliAD(commonRequest),
      ]);
      console.log("@@ validateEmailAD -->> ", validateEmail);

      if (validateEmail.message?.error.code === "Request_ResourceNotFound") {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.NEW_USER.MISSING_EMAIL_AD,
          transactionId
        );
      }

      if (!validateEmail) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.NEW_USER.MISSING_EMAIL,
          transactionId
        );
      }
      const response: CommonResponseListDto<any> = new CommonResponseListDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.data = validateEmail;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateEmailAD",
        this.traceFileName
      );
    }
  }

  // public async validateGetUser(commonRequest: CommonRequest ,userhService: any) {
  //   this.logger.info("validateGetUser...start")
  //   console.log("@Body ==> ", commonRequest.body);
  //   const transactionId: string = commonRequest.headers.transactionId;
  //   try {
  //     if (!commonRequest.headers.transactionId)
  //       return new ErrorModel(STATUS_CODE.CLIENT_ERROR.BAD_REQUEST, ERROR.RESOURCE.TRANSACTIONID, transactionId);
  //     if (!validateUser)
  //       return new ErrorModel(STATUS_CODE.CLIENT_ERROR.NOT_FOUND, `${ERROR.USER.NOT_FOUND} ${userIdReq}`, transactionId);
  //
  //
  //     const response: CommonResponseDto = new CommonResponseDto();
  //     response.code = STATUS_CODE.SUCCESS.OK;
  //     response.transactionId = transactionId;
  //     response.message = SUCCESS.VALIDATE;
  //     return response;
  //   } catch (error) {
  //     console.log("@@ error -->> ", error)
  //     throw applicationInsightsService.errorModel(error, "validateGetUser", this.traceFileName);
  //   }
  // }
  public async validateGetUser(commonRequest: CommonRequest, userService: any) {
    this.logger.info("validateGetUser...start");
    console.log("@Body ==> ", commonRequest.body);
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const userIdReq: any = Number(commonRequest.params?.userId);
      const validateUser = await userService.getUserById(commonRequest);
      console.log("validate user", validateUser);

      if (!commonRequest.headers.transactionId)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      if (!validateUser)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          `${ERROR.USER.NOT_FOUND} ${userIdReq}`,
          transactionId
        );
      console.log("@@@@ validateUser ->> ", validateUser);
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateGetUser",
        this.traceFileName
      );
    }
  }

  public async validateDeleteUser(
    commonRequest: CommonRequest,
    userService: any,
    eventHistoryService: any
  ) {
    this.logger.info("validateDeleteUser...start");
    console.log("path user id ", commonRequest.params.userId);
    const transactionId: string = commonRequest.headers.transactionId;
    const userIdPath: number = Number(commonRequest.params.userId);
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (typeof userIdPath !== "number" || isNaN(userIdPath)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      }
      const [validateUserIdPath, validateRoleUser] = await Promise.all([
        await userService.getDataUserById(commonRequest),
        await userService.getDataUserRoleByUserId(commonRequest),
      ]);
      console.log("validateRoleUser ===>", validateRoleUser);
      if (!validateUserIdPath)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.USER.USER_NOT_FOUND,
          transactionId
        );
      if (validateRoleUser.length > 0) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.ROLES_ACTIVE,
          transactionId
        );
      }
      const transactionIdResult = validateUserIdPath.transactionId;
      const eventHistory = await eventHistoryService.getEventByTransactionId(
        transactionIdResult
      );
      if (eventHistory.status === false || validateUserIdPath.status !== 2) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.UNREADY_MODIFY,
          transactionId
        );
      }
      const response: CommonResponseListDto<any> = new CommonResponseListDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validateUserIdPath;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateDeleteUser",
        this.traceFileName
      );
    }
  }
  public async validateIsReadyModifyUser(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateIsReadyModifyUser...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const userIdPath: number = Number(commonRequest.params.userId);
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (typeof userIdPath !== "number" || isNaN(userIdPath)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.USERID_MUST_BE_NUMBER,
          transactionId
        );
      }
      const [validateUserIdPath, validateRoleUser] = await Promise.all([
        await userService.getDataUserById(commonRequest),
        await userService.getDataUserRoleByUserId(commonRequest),
      ]);
      if (!validateUserIdPath)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.USER.USER_NOT_FOUND,
          transactionId
        );

      if (validateRoleUser.length > 0) {
        return new Payload(200, {
          transactionId: commonRequest.headers.transactionId,
          status: false,
          message: ERROR.ROLE.ROLE_ACTIVE,
          data: validateRoleUser,
        });
      }
      const response: CommonResponseListDto<any> = new CommonResponseListDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validateUserIdPath;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateIsReadyModifyUser",
        this.traceFileName
      );
    }
  }
  private async compareArrValue(arrReq: any, arrResult: any) {
    this.logger.info("compareArrValue...start");
    console.log("==result==>", arrResult);
    console.log("req==>", arrReq);
    let filteredKeywords: any;
    filteredKeywords = arrReq.filter(
      (word: number) => !arrResult.includes(word)
    );

    console.log("filteresd ====>", filteredKeywords);
    const result = [];
    for (const filteredKeyword of filteredKeywords) {
      result.push(arrReq.indexOf(filteredKeyword));
    }
    return result;
  }
  private async findDuplicateTopic(values: any[]) {
    const lookup = values.reduce((a, e) => {
      a[e.approvalTopicId] = ++a[e.approvalTopicId] || 0;
      if (values.includes([e.approvalTopicId])) {
        console.log("masuk kondisi");
        a.push(e);
      }
      return a;
    }, {});

    const topic = values.filter((e) => lookup[e.approvalTopicId]);
    const result = [];
    for (const res of topic) {
      result.push(values.indexOf(res));
    }
    return result;
  }
  private async findDuplicateLevel(values: any[]) {
    const lookup = values.reduce((a, e) => {
      a[e.approvalLevelId] = ++a[e.approvalLevelId] || 0;
      if (values.includes([e.approvalLevelId])) {
        console.log("masuk kondisi");
        a.push(e);
      }
      return a;
    }, {});

    const level = values.filter((e) => lookup[e.approvalLevelId]);
    const result = [];
    for (const res of level) {
      result.push(values.indexOf(res));
    }
    return result;
  }
  public async validateDeleteRole(
    commonRequest: CommonRequest,
    userService: any,
    eventHistoryService: any
  ) {
    this.logger.info("validateDeleteRole...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const roleIdPath: number = Number(commonRequest.params.roleId);
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (typeof roleIdPath !== "number" || isNaN(roleIdPath)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.ROLEID_MUST_BE_NUMBER,
          transactionId
        );
      }
      const [validateRoleIdPath, validateRoleId] = await Promise.all([
        await userService.getDataRoleByRoleId(commonRequest),
        await userService.getDataUserRoleByRoleId(commonRequest),
      ]);
      console.log("validateRoleId ===>", validateRoleId);
      if (!validateRoleIdPath)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
          transactionId
        );
      if (validateRoleId.length > 0) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.USER.ROLES_ACTIVE,
          transactionId
        );
      }
      const transactionIdResult = validateRoleIdPath.transactionId;
      const eventHistory = await eventHistoryService.getEventByTransactionId(
        transactionIdResult
      );
      if (eventHistory.status === false || validateRoleIdPath.status !== 2) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.ROLE.ROLE_UNREADY_MODIFY,
          transactionId
        );
      }
      console.log("data role ==>", validateRoleId);
      const response: CommonResponseListDto<any> = new CommonResponseListDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validateRoleIdPath;
      return response;
    } catch (error) {
      console.log("@@@@@@@ error delete role -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateDeleteRole",
        this.traceFileName
      );
    }
  }

  public async validateIsReadyModifyRole(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateIsReadyModifyRole...start");
    const transactionId: string = commonRequest.headers.transactionId;
    const roleIdPath: number = Number(commonRequest.params.roleId);
    try {
      if (!commonRequest.headers.transactionId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.TRANSACTIONID,
          transactionId
        );
      }
      if (typeof roleIdPath !== "number" || isNaN(roleIdPath)) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
          ERROR.RESOURCE.ROLEID_MUST_BE_NUMBER,
          transactionId
        );
      }
      const [validateRoleIdPath, validateRoleId] = await Promise.all([
        await userService.getDataRoleByRoleId(commonRequest),
        await userService.getDataUserRoleByRoleId(commonRequest),
      ]);
      if (!validateRoleIdPath)
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
          transactionId
        );

      if (validateRoleId.length > 0) {
        return new Payload(200, {
          transactionId: commonRequest.headers.transactionId,
          status: false,
          message: ERROR.ROLE.ROLE_ACTIVE,
          data: validateRoleId,
        });
      }
      const response: CommonResponseListDto<any> = new CommonResponseListDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      response.data = validateRoleIdPath;
      return response;
    } catch (error) {
      console.log("@@ error -->> ", error);
      throw applicationInsightsService.errorModel(
        error,
        "validateIsReadyModifyRole",
        this.traceFileName
      );
    }
  }
  public async validateGetLocationRolePosition(
    commonRequest: CommonRequest,
    userService: any
  ) {
    this.logger.info("validateGetLocationRolePosition...start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      const validateId = await userService.getRoleById(commonRequest);
      if (!validateId) {
        return new ErrorModel(
          STATUS_CODE.CLIENT_ERROR.NOT_FOUND,
          ERROR.ROLE.MISSING_ROLEID,
          transactionId
        );
      }
      if (commonRequest.query.locationId) {
        if (
          typeof Number(commonRequest.query.locationId) !== "number" ||
          isNaN(Number(commonRequest.query.locationId))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE.MUST_BE_NUMBER_LOCATION_ID,
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
        "validateGetLocationRolePosition",
        this.traceFileName
      );
    }
  }
  public async validateGetValidationLocationRolePosition(commonRequest: CommonRequest) {
    this.logger.info("validateGetValidationLocationRolePosition start");
    const transactionId: string = commonRequest.headers.transactionId;
    try {
      if (commonRequest.params.locationId) {
        if (
          typeof Number(commonRequest.params.locationId) !== "number" ||
          isNaN(Number(commonRequest.params.locationId))
        ) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE_POSITIONS.MISSING_LOCATION_ID,
            transactionId
          );
        }
        if (Number(commonRequest.params.locationId) <= 0) {
          return new ErrorModel(
            STATUS_CODE.CLIENT_ERROR.BAD_REQUEST,
            ERROR.ROLE_POSITIONS.MUST_BE_GREATER_THAN_ZERO,
            transactionId
          );
        }
      }
console.log("sucess validation mas gun ")
      const response: CommonResponseDto = new CommonResponseDto();
      response.code = STATUS_CODE.SUCCESS.OK;
      response.transactionId = transactionId;
      response.message = SUCCESS.VALIDATE;
      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateQueryParams",
        this.traceFileName
      );
    }
  }

}
