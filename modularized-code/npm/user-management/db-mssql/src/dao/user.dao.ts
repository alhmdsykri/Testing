import * as stackTrace from "stack-trace";
import {
  CommonRequest,
  CommonResponseListDto,
  RECORD_STATUS,
  ResponseDataDto,
} from "astrafms-common-dto-interface";
import {
  applicationInsightsService,
  Logger,
} from "astrafms-services-error-logging";
import { DatabaseCredential } from "../private/database.credential";
import { sequelizer } from "../private/initialize.database";
import { Permission } from "../models/permission.model";
import { RolePosition } from "../models/role.position.model";
import { Role } from "../models/role.model";
import { RoleDto } from "../dto/role.dto";
import { PermissionDto } from "../dto/permission.dto";
import { PbacPermissionDto } from "../dto/pbac.permission.dto";
import { RbacPermissionDto } from "../dto/rbac.permission.dto";
import { RolePermissionDto } from "../dto/role.permission.dto";
import { RolePositionDto } from "../dto/role.position.dto";
import { UserDto } from "../dto/user.dto";
import { RolePermission } from "../models/role.permission.model";
import { UserRole } from "../models/user.role.model";
import { UserOTP } from "../models/user.otp.model";
import { User } from "../models/user.model";
import { ApprovalTopic } from "../models/approval.topic.model";
import { RoleApproval } from "../models/role.approval.model";
import {
  LOGIN,
  PBAC,
  RBAC,
  ROLES,
  PERMISSIONS,
} from "../constants/CONSTANTS.json";
import { helper } from "../utils/helper";

import Sequelize from "sequelize";
import { RoleApprovalDto } from "../dto/role.approval";
import { ApprovalLevel } from "../models/approvel.level.model";
import { AprovalTopicDto } from "../dto/approval.topic.dto";
import { AprovalLevelDto } from "../dto/approval.level.dto";

// sequelize Direct object to dabase connection
import { sequelize } from "../private/database";
import { STATUS_CODE } from "../constants/CONSTANTS.json";
const Op = Sequelize.Op;

export class UserDao {
  private logger: any = Logger.getLogger("./dao/mssql/user.dao");
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

  // -=-=-=-=-=---=- USER -=-=-=-=-=-=-- //

  public async getUsers(commonRequest: CommonRequest) {
    this.logger.info("[DAO getUsers]...start");
    try {
      const query: any = commonRequest.query;
      const whereClause: any = {};
      let order: any = [];
      const orderBy = query.orderBy ? query.orderBy : "asc";
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PERMISSIONS.DEFAULT.ROW
          : query.row
        : PERMISSIONS.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // Fixed Condition STATUS = 2
      whereClause[Op.and] = [
        {
          status: 2,
        },
      ];

      // SEARCH SECTION
      if (query.nameSearch) {
        whereClause[Op.and].push(
          Sequelize.where(
            Sequelize.fn(
              "concat",
              Sequelize.col("firstName"),
              " ",
              Sequelize.col("lastName")
            ),
            {
              [Op.like]: `%${query.nameSearch}%`,
            }
          )
        );
      } else if (query.idSearch) {
        whereClause[Op.and].push({
          userId: {
            [Op.like]: `%${query.idSearch}%`,
          },
        });
      } else if (query.emailSearch) {
        whereClause[Op.and].push({
          email: {
            [Op.like]: `%${query.emailSearch}%`,
          },
        });
      } else if (query.roleSearch) {
        whereClause[Op.and].push({
          [Op.and]: [
            Sequelize.literal(`SUBSTRING(
              (SELECT TOP (1) ';' + [R].[name]
                FROM [dbo].[UserRole] AS "UR"
                LEFT OUTER JOIN [Role] AS [R] ON [UR].[roleId] = [R].[roleId]
                WHERE  [UR].[userId] = [User].userId
                ORDER BY [UR].[createdAt] ASC
                FOR XML PATH('')),
            2, 200000) LIKE '%${query.roleSearch}%'`),
          ],
        });
      }

      // SORTING SECTION
      if (query.sortBy && query.sortBy === "userId") {
        order = [["userId", `${orderBy}`]];
      } else if (query.sortBy && query.sortBy === "name") {
        order = [
          ["firstName", `${orderBy}`],
          ["lastName", `${orderBy}`],
        ];
      } else if (query.sortBy && query.sortBy === "email") {
        order = [["email", `${orderBy}`]];
      } else if (query.sortBy && query.sortBy === "isSuspended") {
        order = [["isSuspended", `${orderBy}`]];
      } else {
        // Default sort by
        order = [
          ["isSuspended", "ASC"],
          ["firstName", "ASC"],
          ["lastName", "ASC"],
        ];
      }

      // Pagination
      const pData = helper.getPagination(page, row, PERMISSIONS.DEFAULT.ROW);

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryUsers] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL USERS
            const retCount: any = (await User.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [Sequelize.fn("COUNT", Sequelize.col("[userId]")), "total"],
              ],
              where: whereClause,
              include: [],
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL USERS
            const retUsers: any = (await User.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: {
                exclude: [
                  "isSuspended",
                  "oid",
                  "userName",
                  "authenticationType",
                  "password",
                  "failedLoginAttempt",
                  "status",
                  "createdBy",
                  "createdAt",
                  "modifiedBy",
                  "modifiedAt",
                  "uniqueKey",
                  "version",
                ],
                include: [
                  [
                    Sequelize.literal(
                      `(SELECT SUBSTRING(
                          (SELECT TOP (1) ';' + [R].[name]
                            FROM [dbo].[UserRole] AS "UR"
                            LEFT OUTER JOIN [Role] AS [R] ON [UR].[roleId] = [R].[roleId]
                            WHERE  [UR].[userId] = [User].userId
                            ORDER BY [UR].[createdAt] ASC
                            FOR XML PATH('')),
                        2, 200000))`
                    ),
                    "role",
                  ],
                  [
                    Sequelize.fn("ISNULL", Sequelize.col("isSuspended"), false),
                    "isSuspended",
                  ],
                ],
              },
              where: whereClause,
              order,
              limit: pData.limit,
              offset: pData.offset,
            })) as UserDto[];

            resolve(retUsers);
          } catch (error) {
            reject(error);
          }
        }),
      ]);

      const totalDataCountRaw: any[] = queryCount as [];
      const users: any = queryUsers as UserDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const usersResponse: CommonResponseListDto<UserDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: any = page + 2 > maxPage ? null : page + 2;
      usersResponse.page = page + 1;
      usersResponse.nextPage = nextPage;
      usersResponse.row = Number(row);
      usersResponse.total = totalDataCount;
      usersResponse.transactionId = commonRequest.headers?.transactionId;
      usersResponse.message = "Successfully get list of users";
      usersResponse.data = users;

      return usersResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUsers",
        this.traceFileName
      );
    }
  }

  public async getUserById(commonRequest: CommonRequest) {
    this.logger.info("dao getUserById...start");
    try {
      let userId: number = Number(commonRequest.params?.userId || null);
      isNaN(userId) ? (userId = 0) : (userId = userId);
      const filter: any = {
        raw: true,
        attributes: ["userId"],
        where: {
          userId,
        },
      };
      const user: any = await User.findOne(filter);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserById",
        this.traceFileName
      );
    }
  }

  public async getUserByEmailExternal(commonRequest: CommonRequest) {
    this.logger.info("getUserByEmailExternal...start");
    try {
      const whereClause: any = {};
      const email: any = commonRequest.body?.email;
      const userName: any = commonRequest.body?.userName;
      console.log(commonRequest);

      if (email) {
        whereClause.email = email;
      } else if (userName) {
        whereClause.userName = userName;
      } else {
        // prevent select invalid params
        whereClause.userName = "-notExist-";
      }

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: ["userId", "password", "salt"],
        raw: true,
      };
      const retUser: any = await User.findOne(filter);
      const userResponse: any = {};
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserByEmailExternal",
        this.traceFileName
      );
    }
  }

  public async getRoleUsers(commonRequest: CommonRequest) {
    this.logger.info("getRoleUsers...start");
    const userResponse: any = {};
    try {
      const whereClause: any = {};
      const innerWhereClause: any = {};
      const roleId: any = commonRequest.params?.roleId;
      const roleIds: any[] = commonRequest.params?.roleIds;
      const allStatus: boolean = commonRequest.params?.allStatus || false;

      // Active only by default
      if (!allStatus) {
        innerWhereClause.status = 2;
      }

      // Query by single roleId
      if (roleId) {
        whereClause.roleId = roleId;
      }

      // Quuery by array of roleIds
      if (roleIds) {
        if (Array.isArray(roleIds)) {
          whereClause.roleId = roleIds;
        } else {
          whereClause.roleId = [];
        }
      }
      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: [
          Sequelize.fn("DISTINCT", Sequelize.col("[UserRole].[userId]")),
          "userId",
        ],
        raw: true.valueOf,
        include: [
          {
            model: Role,
            attributes: [],
            required: true,
            where: innerWhereClause,
          },
          {
            model: User,
            attributes: [],
            where: innerWhereClause,
            required: true,
          },
        ],
      };
      const retUser: any = await UserRole.findAll(filter);
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoleUsers",
        this.traceFileName
      );
    }
  }

  public async getUsersByStatus(commonRequest: CommonRequest) {
    const statuses: any[] = commonRequest.params?.statuses;
    const userResponse: any = {};
    try {
      const whereClause: any = {
        status: statuses,
      };
      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: ["[userId]", "[status]"],
        raw: true.valueOf,
      };
      const retUser: any = await User.findAll(filter);
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUsersViaStatus",
        this.traceFileName
      );
    }
  }

  public async getUserAssociatedRole(commonRequest: CommonRequest) {
    this.logger.info("getUserAssociatedRole...start");
    const userResponse: any = {};
    try {
      const whereClause: any = {};
      const userId: any = commonRequest.params?.userId;
      const userIds: any[] = commonRequest.params?.userIds;
      const roleId: any = commonRequest.params?.roleId;
      const roleIds: any[] = commonRequest.params?.roleIds;
      if (userId) {
        whereClause.userId = userId;
      }
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        whereClause.userId = userIds;
      }
      if (roleId) {
        whereClause.roleId = roleId;
      }
      if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
        whereClause.roleId = roleIds;
      }
      whereClause.status = 2;

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: ["[roleId]", "[userId]"],
        raw: true,
      };
      const retUser: any = await UserRole.findAll(filter);
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserAssociatedRole",
        this.traceFileName
      );
    }
  }

  public async updateUser(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateUser...start");
    const body = commonRequest.body;
    console.log(commonRequest);
    try {
      const userId: any = commonRequest.params?.userId;
      const user: any = await User.update(body, {
        returning: true,
        where: { userId },
      });
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "updateUser",
        this.traceFileName
      );
    }
  }

  public async createUser(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createUser...start");
    const body = commonRequest.body;
    console.log(commonRequest);
    try {
      const user: any = await User.create(body);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "createUser",
        this.traceFileName
      );
    }
  }

  public async createUserFromDriver(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createUserFromDriver...start");
    const body = commonRequest.body;
    console.log(commonRequest);
    try {
      const user: any = await User.create(body);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "createUserFromDriver",
        this.traceFileName
      );
    }
  }

  public async updateStatusUser(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateStatusUser...start");
    const body = commonRequest.body;

    try {
      const userId = commonRequest.params?.userId;
      const user: any = await User.update(body, {
        returning: true,
        where: { userId },
      });
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "updateStatusUser",
        this.traceFileName
      );
    }
  }

  public async deletePermanentUserRole(commonRequest: CommonRequest) {
    this.logger.info("[deletePermanentUserRole]...start");
    try {
      const params: any = commonRequest.params;
      const retUserRole: any = await UserRole.destroy({
        where: {
          userId: params.userId,
        },
      });
      const rolePositionResponse: any = {};
      rolePositionResponse.transactionId = commonRequest.headers?.transactionId;
      rolePositionResponse.message = "Successfully delete user role";
      rolePositionResponse.data = retUserRole;
      return rolePositionResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "deletePermanentUserRole",
        this.traceFileName
      );
    }
  }

  public async createUserRole(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createUserRole...start");
    const body = commonRequest.body;
    try {
      const arrBody: any[] = body;
      // remove data type
      const arrData: any[] = JSON.parse(JSON.stringify(arrBody));
      console.log(
        "createUserRole  DAO @ BODY roles --> ",
        JSON.stringify(arrData)
      );
      const result: any = await UserRole.bulkCreate(arrData);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "createUserRole",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "createUserRole",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- ROLE -=-=-=-=-=-=-- //

  public async createRole(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createRole...start");
    const body = commonRequest.body;
    try {
      const role: any = await Role.create(body.role);
      const result = role.get({ plain: true });
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "createRole",
        this.traceFileName
      );
    }
  }

  public async updateRole(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateRole...start");
    const body = commonRequest.body;
    console.log(commonRequest);
    try {
      const roleId: any = commonRequest.params?.roleId;
      const filter = {
        where: { roleId },
      };
      const roleItem: any = await Role.findOne(filter);
      if (roleItem) {
        roleItem.name = body.name;
        roleItem.isSuperAdmin = body.isSuperAdmin;
        roleItem.uniqueKey = body.name;
        roleItem.modifiedBy = body.modifiedBy;
        roleItem.modifiedAt = body.modifiedAt;
        roleItem.status = body.status;
        roleItem.transactionId = body.transactionId;

        // if isSuperAdmin is not present in req body, the current data should preserve
        if (body.isSuperAdmin == null) {
          delete roleItem.isSuperAdmin;
        }

        const role: any = await Role.update(roleItem.dataValues, {
          returning: true,
          where: { roleId },
        });
        return role;
      } else {
        throw new Error("Role Id not found");
      }
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "updateRole",
        this.traceFileName
      );
    }
  }

  public async updateRoleStatus(commonRequest: CommonRequest) {
    this.logger.info("updateRoleStatus...start");
    const body = commonRequest.body;
    try {
      const roleId: any = body.roleId;
      const filter = {
        where: { roleId },
      };
      const updateAttr = {
        status: body.status,
      };
      const roleItem: any = await Role.findOne(filter);
      const result = roleItem.get({ plain: true });
      if (result) {
        result.status = body.status;
        await Role.update(updateAttr, filter);
        return true;
      } else {
        throw new Error("Role Id not found");
      }
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "updateRoleStatus",
        this.traceFileName
      );
    }
  }

  public async getRoleById(commonRequest: CommonRequest) {
    this.logger.info("dao getRoleById...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        attributes: ["roleId"],
        where: {
          roleId,
        },
      };
      const role: any = await Role.findOne(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoleById",
        this.traceFileName
      );
    }
  }

  public async getRoleByName(commonRequest: CommonRequest) {
    this.logger.info("dao getRoleByName...start");
    const body = commonRequest.body;
    try {
      const name: any = String(body.name) || null;
      const filter: any = {
        raw: true,
        attributes: ["roleId"],
        where: {
          name,
        },
      };
      const role: any = await Role.findOne(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoleByName",
        this.traceFileName
      );
    }
  }

  public async getRoles(commonRequest: CommonRequest) {
    this.logger.info("[getRoles]...start 1");
    try {
      const query: any = commonRequest.query;
      const whereClause: any = {};
      let order: any = [["name", "ASC"]];
      const groupBy: any[] = [
        "[Role].[name]",
        "[Role].[roleId]",
        "[Role].[status]",
      ];
      const orderBy = query.orderBy ? query.orderBy : "asc";
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? ROLES.DEFAULT.ROW
          : query.row >= ROLES.DEFAULT.MAX_ROW
            ? ROLES.DEFAULT.MAX_ROW
            : query.row
        : ROLES.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // WHERE CALAUSE SECTION

      // Fixed Condition STATUS = 2
      whereClause.status = RECORD_STATUS.COMPLETED;

      // SEARCH SECTION
      if (query.search) {
        whereClause[Op.or] = [
          {
            name: {
              [Op.like]: `%${query.search}%`,
            },
          },
          {
            roleId: {
              [Op.like]: `%${query.search}%`,
            },
          },
        ];
      }

      // SORTING SECTION
      if (query.sortBy && query.sortBy === "roleName") {
        order = [["name", `${orderBy}`]];
      } else if (query.sortBy && query.sortBy === "numberOfUsers") {
        order = [[[Sequelize.literal("numberOfUsers"), `${orderBy}`]]];
      } else {
        // Default sort by
        order = [[[Sequelize.literal("roleName"), `${orderBy}`]]];
      }

      // Pagenation
      const pData = helper.getPagination(page, row, ROLES.DEFAULT.ROW);

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryRoles] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL ROLES
            const retCount: any = (await Role.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn("COUNT", Sequelize.col("[Role].[roleId]")),
                  "total",
                ],
              ],
              where: whereClause,
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL ROLES
            const retRoles: any = (await Role.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              group: groupBy,
              attributes: [
                "roleId",
                ["name", "roleName"],
                "status",
                [
                  Sequelize.fn("COUNT", Sequelize.col("[UserRoles].[userId]")),
                  "numberOfUsers",
                ],
                [
                  Sequelize.literal(
                    `(SELECT DISTINCT roleId FROM RolePosition WHERE roleId = Role.roleId)`
                  ),
                  "dataCompleted",
                ],
              ],
              include: [
                {
                  model: UserRole,
                  attributes: [],
                },
              ],
              where: whereClause,
              order,
              limit: pData.limit,
              offset: pData.offset,
            })) as RoleDto[];
            resolve(retRoles);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const roles: any = queryRoles as RoleDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const rolesResponse: CommonResponseListDto<RoleDto> = {};
      rolesResponse.page = page + 1;
      rolesResponse.row = Number(row);
      rolesResponse.total = totalDataCount;
      rolesResponse.transactionId = commonRequest.headers?.transactionId;
      rolesResponse.message = "";

      // Replace the dataCompleted to 1 if NULL and 2 if value exist
      const newRoles = roles.map((roleData: any) => {
        if (!roleData.dataCompleted) {
          return { ...roleData, dataCompleted: 1 };
        }
        return { ...roleData, dataCompleted: 2 };
      });
      rolesResponse.data = newRoles;

      return rolesResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoles",
        this.traceFileName
      );
    }
  }

  /**
   * This Function was use in FA User CQRS to get all super admin roleIds
   * @param commonRequest
   * @returns
   */
  public async getSuperAdminRoleIds(commonRequest: CommonRequest) {
    const userResponse: any = {};
    try {
      const whereClause: any = {
        status: 2,
        isSuperAdmin: 1,
      };
      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: ["[roleId]", "[status]"],
        raw: true.valueOf,
      };
      const retUser: any = await Role.findAll(filter);
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getSuperAdminRoleIds",
        this.traceFileName
      );
    }
  }

  public async getRole(commonRequest: CommonRequest) {
    this.logger.info("[getRole]...start");
    try {
      const params: any = commonRequest.params;
      const roleId: any = Number(params.roleId) || null;
      const filter: any = {
        where: {
          roleId,
        },
        attributes: [["name", "roleName"]],
        raw: true,
      };
      const retRoles: any = await Role.findOne(filter);
      const rolesResponse: any = {};
      rolesResponse.transactionId = commonRequest.headers?.transactionId;
      rolesResponse.message = "Successfully get role";
      rolesResponse.data = retRoles;
      return rolesResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRole",
        this.traceFileName
      );
    }
  }

  public async getAllRolesWithUsers(commonRequest: CommonRequest) {
    this.logger.info("dao[getAllRolesWithUsers]...start");
    try {
      const whereClause: any = {};
      const params: any = commonRequest.params;
      // const roleId: any = Number(params.roleId) || null;
      const filter: any = {
        where: whereClause,
        attributes: [["name", "roleName"]],
        raw: true,
      };
      const retRoles: any = await UserRole.findAll(filter);
      const rolesResponse: any = {};
      rolesResponse.transactionId = commonRequest.headers?.transactionId;
      rolesResponse.message = "Successfully get role with users";
      rolesResponse.data = retRoles;
      return rolesResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getAllRolesWithUsers",
        this.traceFileName
      );
    }
  }

  public async getRolesInIds(commonRequest: CommonRequest) {
    this.logger.info("[getRolesInIds]...start");
    try {
      const body: any = commonRequest.body;
      const roleIds: any[] = body.roles;
      const filter: any = {
        where: {
          roleId: {
            [Op.in]: roleIds,
          },
        },
        attributes: ["roleId"],
        raw: true,
      };
      const retRoles: any = await Role.findAll(filter);
      const rolesResponse: any = {};
      rolesResponse.transactionId = commonRequest.headers?.transactionId;
      rolesResponse.message = "Successfully get roles in ids";
      rolesResponse.data = retRoles;
      return rolesResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRolesInIds",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- ROLE PERMISSION -=-=-=-=-=-=-- //

  public async createRolePermission(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createRolePermission...bulk insert start");
    const body = commonRequest.body;
    try {
      if (body.permissions && body?.permissions.length > 0) {
        const permissions: [] = body.permissions;
        const bulkRolePermission: any[] = [];
        await Promise.all(
          permissions.map(async (permission: any) => {
            permission.roleId = permission.roleId;
            permission.uniqueKey =
              String(permission.roleId) +
              String(permission.permissionId) +
              Date.now();
            delete permission.rolePermissionId;
            // permissionData = await RolePermission.create(permission);
            bulkRolePermission.push(permission);
          })
        );
        console.log(
          "@@@ bulkRolePermission =>> ",
          JSON.stringify(bulkRolePermission)
        );
        const result: any = await RolePermission.bulkCreate(bulkRolePermission);
        return result;
      } else {
      }
      return true;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "createRolePermission",
        this.traceFileName
      );
    }
  }

  public async updateRolePermission(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateRole...transaction start");
    const body = commonRequest.body;
    try {
      const roleId: any = commonRequest.params?.roleId;
      let permissionData: any = {};
      if (body.permissions && body?.permissions.length > 0) {
        const permissions: [] = body.permissions;

        const result = await sequelize.transaction(async (t: any) => {
          await Promise.all(
            permissions.map(async (permission: any) => {
              const permissionId: any = permission.permissionId;
              const pfilter = {
                raw: true,
                where: { permissionId, roleId },
              };

              const rolePermissionItem: any = await RolePermission.findOne(
                pfilter
              );
              if (rolePermissionItem) {
                rolePermissionItem.visible = permission.visible;
                rolePermissionItem.enable = permission.enable;
                rolePermissionItem.active = permission.active;
                rolePermissionItem.modifiedBy = permission.modifiedBy;
                rolePermissionItem.modifiedAt = permission.modifiedAt;
                permissionData = await RolePermission.update(
                  rolePermissionItem,
                  {
                    transaction: t,
                    returning: true,
                    where: { permissionId, roleId },
                  }
                );
              } else {
                permission.roleId = Number(roleId);
                permission.uniqueKey =
                  String(roleId) + String(permission.permissionId) + Date.now();
                permission.createdBy = permission.modifiedBy;
                permission.createdAt = permission.modifiedAt;
                permission.status = 2;
                permissionData = await RolePermission.create(permission, {
                  transaction: t,
                });
              }
            })
          ); // promise end

          return permissionData;
        }); // trasaction end
      }
      return true;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "updateRole",
        this.traceFileName
      );
    }
  }

  public async getPermissions(commonRequest: CommonRequest) {
    this.logger.info("[getPermissions]...start");
    try {
      const query: any = commonRequest.query;
      const whereClause: any = {};
      const order: any = [
        ["applicationId", "ASC"],
        ["parentFeatureId", "ASC"],
        ["featureName", "ASC"],
      ];
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PERMISSIONS.DEFAULT.ROW
          : query.row
        : PERMISSIONS.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // Pagenation
      const pData = helper.getPagination(page, row, PERMISSIONS.DEFAULT.ROW);

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryPermissions] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL PERMISSIONS
            const retCount: any = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[Permission].[permissionId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL PERMISSIONS
            const retpermissions: any = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "permissionId",
                "applicationId",
                "parentFeatureId",
                "featureName",
                "type",
                "attributeId",
                "uniqueKey",
              ],
              where: whereClause,
              order,
              limit: pData.limit,
              offset: pData.offset,
            })) as PermissionDto[];
            resolve(retpermissions);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const permissions: any = queryPermissions as PermissionDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const permissionsResponse: CommonResponseListDto<PermissionDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: any = page + 2 > maxPage ? null : page + 2;
      permissionsResponse.page = page + 1;
      permissionsResponse.nextPage = nextPage;
      permissionsResponse.row = Number(row);
      permissionsResponse.total = totalDataCount;
      permissionsResponse.transactionId = commonRequest.headers?.transactionId;
      permissionsResponse.message = "Successfully get list of permissions";
      permissionsResponse.data = permissions;

      return permissionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPermissions",
        this.traceFileName
      );
    }
  }

  public async getRolePermissions(commonRequest: CommonRequest) {
    this.logger.info("[getRolePermissions]...start");
    try {
      const query: any = commonRequest.query;
      const params: any = commonRequest.params;
      const whereClause: any = {
        roleId: params.roleId,
      };
      const order: any = [
        ["applicationId", "ASC"],
        ["parentFeatureId", "ASC"],
        ["featureName", "ASC"],
      ];
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PERMISSIONS.DEFAULT.ROW
          : query.row
        : PERMISSIONS.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // Pagenation
      const pData = helper.getPagination(page, row, PERMISSIONS.DEFAULT.ROW);

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryPermissions] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL PERMISSIONS
            const retCount: any = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[Permission].[permissionId]")
                  ),
                  "total",
                ],
              ],
              include: [
                {
                  model: RolePermission,
                  as: "rp",
                  attributes: [],
                  where: whereClause,
                  required: false,
                  paranoid: false,
                },
              ],
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL PERMISSIONS
            const retRolePermissions: any = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "[permissionId]",
                "[applicationId]",
                "[parentFeatureId]",
                "[featureName]",
                "[type]",
                "[attributeId]",
                [
                  Sequelize.fn("ISNULL", Sequelize.col("[rp].[visible]"), 0),
                  "v",
                ],
                [
                  Sequelize.fn("ISNULL", Sequelize.col("[rp].[enable]"), 0),
                  "e",
                ],
                [
                  Sequelize.fn("ISNULL", Sequelize.col("[rp].[active]"), 0),
                  "a",
                ],
              ],
              order,
              include: [
                {
                  model: RolePermission,
                  as: "rp",
                  attributes: [],
                  where: whereClause,
                  required: false,
                  paranoid: false,
                },
              ],
              limit: pData.limit,
              offset: pData.offset,
            })) as RolePermissionDto[];
            resolve(retRolePermissions);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const permissions: any = queryPermissions as RolePermissionDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const permissionsResponse: CommonResponseListDto<RolePermissionDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: any = page + 2 > maxPage ? null : page + 2;
      permissionsResponse.page = page + 1;
      permissionsResponse.nextPage = nextPage;
      permissionsResponse.row = Number(row);
      permissionsResponse.total = totalDataCount;
      permissionsResponse.transactionId = commonRequest.headers?.transactionId;
      permissionsResponse.message = "Successfully list of get role permission";
      permissionsResponse.data = permissions;

      return permissionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRolePermissions",
        this.traceFileName
      );
    }
  }

  public async validatePermissionExist(commonRequest: CommonRequest) {
    this.logger.info("dao validatePermissionExist...start");
    try {
      const body: any = commonRequest.body.permissions;
      const result = body.map(
        (permission: { permissionId: number }) => permission.permissionId
      );
      const pfilter: any = {
        raw: true,
        attributes: ["permissionId"],
        order: [["permissionId", "ASC"]],
        where: {
          permissionId: result,
        },
      };
      const permissions: any = await Permission.findAll(pfilter);
      return permissions;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validatePermissionExist",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- ROLE POSITION -=-=-=-=-=-=-- //

  public async getRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[getRolePosition]...start");
    try {
      const query: any = commonRequest.query;
      const params: any = commonRequest.params;
      const whereClause: any = {
        roleId: params.roleId,
      };
      const order: any = [
        ["companyName", "ASC"],
        ["businessUnitName", "ASC"],
        ["branchName", "ASC"],
        ["locationName", "ASC"],
      ];
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PERMISSIONS.DEFAULT.ROW
          : query.row
        : PERMISSIONS.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // Fixed Condition STATUS = 2
      whereClause.status = RECORD_STATUS.COMPLETED;

      // SEARCH SECTION
      if (query.companySearch) {
        whereClause[Op.or] = [
          {
            companyName: {
              [Op.like]: `%${query.companySearch}%`,
            },
          },
          {
            companyCode: {
              [Op.like]: `%${query.companySearch}%`,
            },
          },
        ];
      } else if (query.businessUnitSearch) {
        whereClause[Op.or] = [
          {
            businessUnitName: {
              [Op.like]: `%${query.businessUnitSearch}%`,
            },
          },
          {
            businessUnitCode: {
              [Op.like]: `%${query.businessUnitSearch}%`,
            },
          },
        ];
      } else if (query.branchSearch) {
        whereClause[Op.or] = [
          {
            branchName: {
              [Op.like]: `%${query.branchSearch}%`,
            },
          },
          {
            branchCode: {
              [Op.like]: `%${query.branchSearch}%`,
            },
          },
        ];
      } else if (query.locationSearch) {
        whereClause[Op.or] = [
          {
            locationName: {
              [Op.like]: `%${query.locationSearch}%`,
            },
          },
          {
            locationCode: {
              [Op.like]: `%${query.locationSearch}%`,
            },
          },
        ];
      }

      // Pagination
      const pData = helper.getPagination(page, row, PERMISSIONS.DEFAULT.ROW);

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryPosition] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL PERMISSIONS
            const retCount: any = (await RolePosition.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[RolePosition].[rolePositionId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL ROLE POSITION
            const retRolePosition: any = (await RolePosition.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "[rolePositionId]",
                "[companyName]",
                "[companyCode]",
                "[businessUnitName]",
                "[businessUnitCode]",
                "[branchName]",
                "[branchCode]",
                "[locationName]",
                "[locationCode]",
                "[modifiedAt]",
              ],
              where: whereClause,
              order,
              limit: pData.limit,
              offset: pData.offset,
            })) as RolePositionDto[];
            resolve(retRolePosition);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const permissions: any = queryPosition as RolePositionDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const permissionsResponse: CommonResponseListDto<RolePositionDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: any = page + 2 > maxPage ? null : page + 2;
      permissionsResponse.page = page + 1;
      permissionsResponse.nextPage = nextPage;
      permissionsResponse.row = Number(row);
      permissionsResponse.total = totalDataCount;
      permissionsResponse.transactionId = commonRequest.headers?.transactionId;
      permissionsResponse.message = "Successfully list of get role position";
      permissionsResponse.data = permissions;

      return permissionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRolePosition",
        this.traceFileName
      );
    }
  }

  public async getRolePositionDetails(commonRequest: CommonRequest) {
    this.logger.info("[getRolePositionDetails]...start");
    try {
      const query: any = commonRequest.query;
      const params: any = commonRequest.params;
      const whereClause: any = {
        roleId: params.roleId,
      };
      const order: any = [
        ["companyName", "ASC"],
        ["businessUnitName", "ASC"],
        ["branchName", "ASC"],
        ["locationName", "ASC"],
      ];
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PERMISSIONS.DEFAULT.ROW
          : query.row
        : PERMISSIONS.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // Fixed Condition STATUS = 2
      whereClause.status = RECORD_STATUS.COMPLETED;

      // SEARCH SECTION
      if (query.companyId) {
        whereClause.companyId = query.companyId;
      }

      // Pagination
      const pData = helper.getPagination(page, row, PERMISSIONS.DEFAULT.ROW);

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryPosition] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL PERMISSIONS
            const retCount: any = (await RolePosition.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[RolePosition].[rolePositionId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL ROLE POSITION
            const retRolePosition: any = (await RolePosition.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "[rolePositionId]",
                "[companyId]",
                "[companyName]",
                "[companyCode]",
                "[businessUnitId]",
                "[businessUnitName]",
                "[businessUnitCode]",
                "[branchId]",
                "[branchName]",
                "[branchCode]",
                "[locationId]",
                "[locationName]",
                "[locationCode]",
              ],
              where: whereClause,
              order,
              limit: pData.limit,
              offset: pData.offset,
            })) as RolePositionDto[];
            resolve(retRolePosition);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const permissions: any = queryPosition as RolePositionDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const permissionsResponse: CommonResponseListDto<RolePositionDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: any = page + 2 > maxPage ? null : page + 2;
      permissionsResponse.page = page + 1;
      permissionsResponse.nextPage = nextPage;
      permissionsResponse.row = Number(row);
      permissionsResponse.total = totalDataCount;
      permissionsResponse.transactionId = commonRequest.headers?.transactionId;
      permissionsResponse.message =
        "Successfully list of get role position details";
      permissionsResponse.data = permissions;

      return permissionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRolePositionDetails",
        this.traceFileName
      );
    }
  }

  public async createRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createRolePosition...start");
    const body = commonRequest.body;
    try {
      const arrBody: any[] = body;
      // remove data type
      const arrData: any[] = JSON.parse(JSON.stringify(arrBody));
      const result: any = await RolePosition.bulkCreate(arrData);
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "createRolePosition",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "createRolePosition",
        this.traceFileName
      );
    }
  }

  public async getValidationLocationRolePosition(commonRequest: CommonRequest) {
    this.logger.info("DAO ValidationLocationRolePosition...start");
    try {
      const locationId: number = commonRequest.params.locationId;
      let rolePositionId: boolean = false;
      const whereClausePersonalData: any = {
        locationId: locationId,
        status: 2,
      };

      const locationRolePosition: any = await RolePosition.findAll({
        logging: console.log,
        subQuery: false,
        raw: true,
        attributes: ["rolePositionId"],
        where: whereClausePersonalData
      });

      if (locationRolePosition.length > 0) {
        rolePositionId = true
      }

      const response: ResponseDataDto = {};
      response.transactionId = commonRequest.headers?.transactionId;
      response.code = STATUS_CODE.SUCCESS.OK;
      response.message = "Successfully get role position by locationId";
      response.data = { "isValid": rolePositionId }

      return response;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "ValidationLocationRolePosition",
        this.traceFileName
      );
    }
  }

  public async deletePermanentRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[deletePermanentRolePosition]...start");
    try {
      const whereClause: any = {};
      const headers: any = commonRequest.headers;
      const params: any = commonRequest.params;
      const retRolePosition: any = await RolePosition.destroy({
        where: {
          roleId: params.roleId,
        },
      });
      const rolePositionResponse: any = {};
      rolePositionResponse.transactionId = commonRequest.headers?.transactionId;
      rolePositionResponse.message = "Successfully delete role position";
      rolePositionResponse.data = retRolePosition;
      return rolePositionResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "deletePermanentRolePosition",
        this.traceFileName
      );
    }
  }



  // -=-=-=-=-=-=-=-=-=-=- CQRS Role Position -=-=-=-=-=-=-= //

  public async updateRolePositionLocationCQRS(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateRolePositionLocationCQRS...start");
    const body = commonRequest.body;
    const params = commonRequest.params;
    const locationId = params.locationId;
    try {
      const result: any = await RolePosition.update(body, {
        returning: true,
        where: { locationId },
      });
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "updateRolePositionLocationCQRS",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "updateRolePositionLocationCQRS",
        this.traceFileName
      );
    }
  }

  public async deleteRolePositionLocationCQRS(commonRequest: CommonRequest) {
    this.logger.info("[DAO] deleteRolePositionLocationCQRS...start");
    const body = commonRequest.body;
    const params = commonRequest.params;
    const locationId = params.locationId;
    try {
      const result: any = await RolePosition.update(body, {
        returning: true,
        where: { locationId }
      });
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "deleteRolePositionLocationCQRS",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "updateRolePositionLocationCQRS",
        this.traceFileName
      );
    }
  }

  public async updateRolePositionBranchCQRS(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateRolePositionBranchCQRS...start");
    const body = commonRequest.body;
    const params = commonRequest.params;
    const branchId = params.branchId;
    try {
      const result: any = await RolePosition.update(body, {
        returning: true,
        where: { branchId },
      });
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "updateRolePositionBranchCQRS",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "updateRolePositionBranchCQRS",
        this.traceFileName
      );
    }
  }

  public async updateRolePositionBusinessUnitCQRS(
    commonRequest: CommonRequest
  ) {
    this.logger.info("[DAO] updateRolePositionBusinessUnitCQRS...start");
    const body = commonRequest.body;
    const params = commonRequest.params;
    const businessUnitId = params.businessUnitId;
    try {
      const result: any = await RolePosition.update(body, {
        returning: true,
        where: { businessUnitId },
      });
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "updateRolePositionBusinessUnitCQRS",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "updateRolePositionBusinessUnitCQRS",
        this.traceFileName
      );
    }
  }

  public async updateRolePositionCompanyCQRS(commonRequest: CommonRequest) {
    this.logger.info("[DAO] updateRolePositionCompanyCQRS...start");
    const body = commonRequest.body;
    const params = commonRequest.params;
    const companyId = params.companyId;
    try {
      const result: any = await RolePosition.update(body, {
        returning: true,
        where: { companyId },
      });
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "updateRolePositionCompanyCQRS",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "updateRolePositionCompanyCQRS",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=---=- ROLE APPROVAL -=-=-=-=-=-=-- //

  public async deleteRoleApprovalById(commonRequest: CommonRequest) {
    this.logger.info("dao deleteRoleApprovalById...start");
    try {
      let roleApprovalId: number = Number(
        commonRequest.params?.roleApprovalId || null
      );
      const status: number = 0;
      isNaN(roleApprovalId)
        ? (roleApprovalId = 0)
        : (roleApprovalId = roleApprovalId);
      const filter: any = {
        raw: true,
        attributes: ["roleApprovalId"],
        where: {
          roleApprovalId,
          status,
        },
      };
      const role: any = await RoleApproval.findOne(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "deleteRoleApprovalById",
        this.traceFileName
      );
    }
  }

  public async getRoleApprovalById(commonRequest: CommonRequest) {
    this.logger.info("dao getRoleApprovalById...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        attributes: ["roleId"],
        where: {
          status: RECORD_STATUS.COMPLETED,
          roleId,
        },
      };
      const roleApproval: any = await RoleApproval.findOne(filter);
      console.log(roleApproval);
      return roleApproval;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoleApprovalById",
        this.traceFileName
      );
    }
  }

  public async validateRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("dao validateRoleApproval...start");
    try {
      const roleId: number = commonRequest.params?.roleId;
      const approvalId: number = commonRequest.body?.approvalId;
      const approvalLevel: number = commonRequest.body?.approvalLevel;
      const filter: any = {
        raw: true,
        attributes: ["roleApprovalId"],
        where: [
          {
            [Op.or]: [
              {
                approvalId,
                approvalLevel,
              },
              {
                approvalId,
                roleId,
              },
            ],
          },
          { status: 2 },
        ],
      };
      console.log(filter);
      const approval: any = await RoleApproval.findOne(filter);
      return approval;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "validateRoleApproval",
        this.traceFileName
      );
    }
  }

  public async getTopicByApprovalId(commonRequest: CommonRequest) {
    this.logger.info("dao getTopicByApprovalId...start");
    try {
      const approvalTopicId: number = commonRequest.body?.approvalId;
      const filter: any = {
        raw: true,
        attributes: ["approvalTopicId"],
        where: [
          {
            approvalTopicId,
          },
          {
            status: 2,
          },
        ],
      };
      const approval: any = await ApprovalTopic.findOne(filter);
      return approval;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getTopicByApprovalId",
        this.traceFileName
      );
    }
  }

  public async getLevelByApprovalId(commonRequest: CommonRequest) {
    this.logger.info("dao getLevelByApprovalId...start");
    try {
      const approvalLevelId: number = commonRequest.body?.approvalLevel;
      const approvalTopicId: number = commonRequest.body?.approvalId;
      const filter: any = {
        raw: true,
        attributes: ["approvalLevelId", "approvalTopicId"],
        where: [
          {
            approvalTopicId,
            approvalLevelId,
          },
          {
            status: 2,
          },
        ],
      };
      const approval: any = await ApprovalLevel.findOne(filter);
      return approval;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getLevelByApprovalId",
        this.traceFileName
      );
    }
  }

  public async createRoleApprovals(commonRequest: CommonRequest, t: any) {
    this.logger.info("[DAO] createRoleApprovals...start");
    const body = commonRequest.body;
    try {
      const arrBody: any[] = body;
      // remove data type
      const arrData: any[] = JSON.parse(JSON.stringify(arrBody));
      const result: any = await RoleApproval.bulkCreate(arrData);
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "createRoleApprovals",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "createRoleApprovals",
        this.traceFileName
      );
    }
  }

  public async deleteRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("[DAO] deleteRoleApproval...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.status,
        modifiedBy: commonRequest.headers.userId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { roleApprovalId: commonRequest.params.roleApprovalId },
      };
      const result: any = await RoleApproval.update(arrBody, filter);
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "deleteRoleApproval",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "deleteRoleApproval",
        this.traceFileName
      );
    }
  }

  public async getListRoleApprovals(commonRequest: CommonRequest) {
    this.logger.info("[DAO getListRoleApproval]...start");
    try {
      const roleIdParam: any = commonRequest.params.roleId;
      const query: any = commonRequest.query;
      const whereClause: any = {};
      let order: any = [];
      const orderBy = query.orderBy ? query.orderBy : "asc";
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PERMISSIONS.DEFAULT.ROW
          : query.row
        : PERMISSIONS.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: 2,
        },
      ];
      if (roleIdParam) {
        whereClause[Op.and].push({ roleId: roleIdParam });
      }

      // SEARCH SECTION
      if (query.approvalTopicSearch) {
        whereClause[Op.and].push(
          Sequelize.literal(
            `[AT].[description] LIKE '%${query.approvalTopicSearch}%'`
          )
        );
      } else if (query.approvalLevelSearch) {
        whereClause[Op.and].push(
          Sequelize.literal(
            `[AL].[description] LIKE '%${query.approvalLevelSearch}%'`
          )
        );
      }

      // SORTING SECTION
      if (query.sortBy && query.sortBy === "approvalLevel") {
        order = [
          [["AL", "name", `${orderBy}`]],
          [["AT", "description", "ASC"]],
        ];
      } else {
        // Default sort by
        order = [[["AL", "name", "ASC"]], [["AT", "description", "ASC"]]];
      }

      // Pagination
      const pData = helper.getPagination(page, row, PERMISSIONS.DEFAULT.ROW);
      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryApproval] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL APPROVALS
            const retApprovals: any = (await RoleApproval.findAll({
              logging: console.log,
              raw: true,
              subQuery: false,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[RoleApproval].[roleApprovalId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
              include: [
                {
                  model: ApprovalLevel,
                  as: "AL",
                  attributes: [],
                  required: true,
                  paranoid: false,
                },
                {
                  model: ApprovalTopic,
                  as: "AT",
                  attributes: [],
                  required: true,
                  paranoid: false,
                },
              ],
            })) as RoleApprovalDto[];
            resolve(retApprovals);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL APPROVALS
            const retApprovals: any = (await RoleApproval.findAll({
              logging: console.log,
              subQuery: false,
              attributes: [
                ["[isSegatedDuty]", "segregationOfDuty"],
                ["[modifiedAt]", "lastUpdate"],
                "approvalId",
                "approvalLevel",
              ],
              where: whereClause,
              include: [
                {
                  model: ApprovalLevel,
                  as: "AL",
                  attributes: [["[name]", "approvelLevel"]],
                  required: true,
                  paranoid: false,
                },
                {
                  model: ApprovalTopic,
                  as: "AT",
                  attributes: [["description", "approvalTopic"]],
                  required: true,
                  paranoid: false,
                },
              ],
              order,
              raw: true,
              nest: true,
              limit: pData.limit,
              offset: pData.offset,
            })) as RoleApprovalDto[];
            resolve(retApprovals);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];

      const roleApprovals: any = queryApproval as RoleApprovalDto[];
      const roleApprovalDatas: any[] = [];
      for (const RA of roleApprovals) {
        const dataMapped = {
          segregationOfDuty: RA.segregationOfDuty,
          lastUpdate: RA.lastUpdate,
          approvalLevel: RA.AL.approvelLevel,
          approvalTopic: RA.AT.approvalTopic,
          approvalTopicId: RA.approvalId,
          approvalLevelId: RA.approvalLevel,
        };
        roleApprovalDatas.push(dataMapped);
      }
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const approvalsResponse: CommonResponseListDto<RoleApprovalDto> = {};
      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: any = page + 2 > maxPage ? null : page + 2;
      approvalsResponse.page = page + 1;
      approvalsResponse.nextPage = nextPage;
      approvalsResponse.row = Number(row);
      approvalsResponse.total = totalDataCount;
      approvalsResponse.transactionId = commonRequest.headers?.transactionId;
      approvalsResponse.message = "Successfully get list of role Approval";
      approvalsResponse.data = roleApprovalDatas;

      return approvalsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "RoleApproval",
        this.traceFileName
      );
    }
  }

  public async getRoleApprovalByRoleId(commonRequest: CommonRequest) {
    this.logger.info("dao getRoleApprovalByRoleId...start");
    try {
      const roleId: number = commonRequest.params?.roleId || null;
      const filter: any = {
        attributes: ["approvalId", "approvalLevel"],
        where: {
          roleId,
        },
      };
      const ra: any = await RoleApproval.findAll(filter);
      return ra;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoleApprovalByRoleId",
        this.traceFileName
      );
    }
  }

  public async getApprovalTopics(commonRequest: CommonRequest) {
    this.logger.info("[getApprovalTopics]...start ");
    try {
      const query: any = commonRequest.query;
      let whereClause: any = {};
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? ROLES.DEFAULT.ROW
          : query.row >= ROLES.DEFAULT.MAX_ROW
            ? ROLES.DEFAULT.MAX_ROW
            : query.row
        : ROLES.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // WHERE CALAUSE SECTION

      // Fixed Condition STATUS = 2
      whereClause.status = RECORD_STATUS.COMPLETED;
      whereClause = {
        status: RECORD_STATUS.COMPLETED,
      };
      // Pagenation
      const pData = helper.getPagination(page, row, ROLES.DEFAULT.ROW);
      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryRoles] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL APPROVAL TOPICS
            const retCount: any = (await ApprovalTopic.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[approvalTopic].[approvalTopicId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL ROLES
            const retApprovalTopics: any = (await ApprovalTopic.findAll({
              logging: console.log,
              subQuery: false,
              attributes: ["approvalTopicId", ["description", "approvalTopic"]],
              where: whereClause,
              limit: pData.limit,
              offset: pData.offset,
            })) as unknown as AprovalTopicDto[];
            resolve(retApprovalTopics);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const AprovalTopics: any = queryRoles as AprovalTopicDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const AprovalTopicDtoResponse: CommonResponseListDto<AprovalTopicDto> =
        {};
      AprovalTopicDtoResponse.page = page + 1;
      AprovalTopicDtoResponse.row = Number(row);
      AprovalTopicDtoResponse.total = totalDataCount;
      AprovalTopicDtoResponse.transactionId =
        commonRequest.headers?.transactionId;
      AprovalTopicDtoResponse.message =
        "Successfully get  list of approval topics";
      AprovalTopicDtoResponse.data = AprovalTopics;

      return AprovalTopicDtoResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRoles",
        this.traceFileName
      );
    }
  }

  public async getApprovalLevels(
    commonRequest: CommonRequest,
    idApprovals: any
  ) {
    this.logger.info("[getApprovalLevels]...start ", idApprovals);
    try {
      const query: any = commonRequest.query;
      let whereClause: any = {};
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? ROLES.DEFAULT.ROW
          : query.row >= ROLES.DEFAULT.MAX_ROW
            ? ROLES.DEFAULT.MAX_ROW
            : query.row
        : ROLES.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // WHERE CALAUSE SECTION

      // Fixed Condition STATUS = 2
      whereClause.status = RECORD_STATUS.COMPLETED;
      whereClause = {
        status: RECORD_STATUS.COMPLETED,
        approvalTopicId: query.approvalTopicId,
      };
      if (idApprovals.length > 0) {
        whereClause = {
          status: RECORD_STATUS.COMPLETED,
          approvalTopicId: query.approvalTopicId,
          approvalLevelId: {
            [Op.notIn]: idApprovals,
          },
        };
      }
      // Pagenation
      const pData = helper.getPagination(page, row, ROLES.DEFAULT.ROW);
      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryRoles] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // COUNT ALL ApprovalLevel
            const retCount: any = (await ApprovalLevel.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                [
                  Sequelize.fn(
                    "COUNT",
                    Sequelize.col("[ApprovalLevel].[approvalLevelId]")
                  ),
                  "total",
                ],
              ],
              where: whereClause,
            })) as [];
            resolve(retCount);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL APPROVAL LEVELS
            const retApprovalTopics: any = (await ApprovalLevel.findAll({
              logging: console.log,
              subQuery: false,
              attributes: ["approvalLevelId", ["name", "approvalLevel"]],
              where: whereClause,
              limit: pData.limit,
              offset: pData.offset,
            })) as unknown as AprovalLevelDto[];
            resolve(retApprovalTopics);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const totalDataCountRaw: any[] = queryCount as [];
      const AprovalLevels: any = queryRoles as AprovalLevelDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const AprovalTopicDtoResponse: CommonResponseListDto<AprovalLevelDto> =
        {};
      AprovalTopicDtoResponse.page = page + 1;
      AprovalTopicDtoResponse.row = Number(row);
      AprovalTopicDtoResponse.total = totalDataCount;
      AprovalTopicDtoResponse.transactionId =
        commonRequest.headers?.transactionId;
      AprovalTopicDtoResponse.message =
        "Successfully get  list of approval Levels";
      AprovalTopicDtoResponse.data = AprovalLevels;

      return AprovalTopicDtoResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getAprovalLevels",
        this.traceFileName
      );
    }
  }

  public async deletePermanentRoleApproval(
    commonRequest: CommonRequest,
    t: any
  ) {
    this.logger.info("[deletePermanentRoleApproval]...start");
    try {
      const whereClause: any = {};
      const headers: any = commonRequest.headers;
      const params: any = commonRequest.params;
      const retRolePosition: any = await RoleApproval.destroy({
        where: {
          roleId: params.roleId,
        },
        // transaction: t
      });
      const roleApprovals: any = {};
      roleApprovals.transactionId = commonRequest.headers?.transactionId;
      roleApprovals.message = "Successfully delete role approval ";
      roleApprovals.data = retRolePosition;

      return roleApprovals;
    } catch (error) {
      throw applicationInsightsService.errorModel(error, "deletePermanentRoleApproval", this.traceFileName);
    }
  }

  // -=-=-=-=-=---=- AUTHENTICATION SECTION -=-=-=-=-=-=-- //

  public async updateLoginStatus(commonRequest: CommonRequest) {
    this.logger.info("updateLoginStatus...start");
    try {
      let userData: any = {};
      let userItem: any = {};
      const whereClause: any = {};
      const headers: any = commonRequest.headers;
      const userId: any = commonRequest.body?.userId;
      const personalId: any = commonRequest.body?.personalId;
      const email: any = commonRequest.body?.email;
      const userName: any = commonRequest.body?.userName;
      const isSuspended: any = commonRequest.body?.isSuspended;
      let failedLoginAttempt: number = commonRequest.body?.failedLoginAttempt;
      const maxLoginAttempt = commonRequest.headers?.maxLoginAttempt;
      if (email) {
        whereClause.email = email;
      } else if (userName) {
        whereClause.userName = userName;
      } else if (personalId) {
        whereClause.personalId = personalId;
      } else if (userId) {
        whereClause.userId = userId;
      } else {
        // Prevent invalid selection
        whereClause.userId = -1;
      }

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: [
          "userId",
          "userName",
          "email",
          "isSuspended",
          "failedLoginAttempt",
        ],
        raw: true,
      };
      const retUser: any = await User.findOne(filter);
      if (retUser) {
        let toSuspend: number = 0;
        failedLoginAttempt = retUser?.failedLoginAttempt
          ? retUser.failedLoginAttempt
          : 0;
        const newFailedLoginAttempt: number = Number(failedLoginAttempt) + 1;

        if (newFailedLoginAttempt >= maxLoginAttempt) {
          toSuspend = 1;
        }
        userItem = {
          isSuspended: toSuspend,
          failedLoginAttempt: newFailedLoginAttempt,
        };
        userData = await User.update(userItem, {
          returning: true,
          where: whereClause,
        });
      }
      const userResponse: any = {};
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = userItem;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "updateLoginStatus",
        this.traceFileName
      );
    }
  }

  public async getUserPersonalIdOTP(commonRequest: CommonRequest) {
    this.logger.info("getUserPersonalIdOTP...start -> ", commonRequest);
    try {
      const whereClause: any = {};
      const userId: any = commonRequest.params?.userId;
      const otp: any = commonRequest.body?.otp;
      const otpExpirationMin: number = commonRequest.headers?.otpExpirationMin;

      if (otp) {
        whereClause.otp = otp;
      }

      whereClause.userId = userId;
      whereClause.isActive = 1;
      whereClause.createdAt = {
        [Op.gte]: Sequelize.literal(
          `DATEADD(minute, -${otpExpirationMin},  GETUTCDATE())`
        ),
      };

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: ["userId", "otp"],
        raw: true,
        order: [["[createdAt]", "DESC"]],
      };
      const retUser: any = await UserOTP.findOne(filter);
      const userResponse: any = {};
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserPersonalIdOTP",
        this.traceFileName
      );
    }
  }

  public async resetLoginStatus(commonRequest: CommonRequest) {
    this.logger.info("[dao]resetLoginStatus...start");
    try {
      let userData: any = {};
      const whereClause: any = {};
      const headers: any = commonRequest.headers;
      const userId: any = commonRequest.body?.userId;
      const personalId: any = commonRequest.body?.personalId;
      const email: any = commonRequest.body?.email;
      const userName: any = commonRequest.body?.userName;
      if (email) {
        whereClause.email = email;
      } else if (userName) {
        whereClause.userName = userName;
      } else if (personalId) {
        whereClause.personalId = personalId;
      } else if (userId) {
        whereClause.userId = userId;
      } else {
        // Prevent invalid selection
        whereClause.userId = -1;
      }

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: [
          "userId",
          "userName",
          "email",
          "isSuspended",
          "failedLoginAttempt",
        ],
        raw: true,
      };
      const retUser: any = await User.findOne(filter);
      if (retUser) {
        const toSuspend: number = 0;
        const newFailedLoginAttempt: number = 0;
        const userItem: any = {
          isSuspended: toSuspend,
          failedLoginAttempt: newFailedLoginAttempt,
        };
        userData = await User.update(userItem, {
          returning: true,
          where: whereClause,
        });
      }
      const userResponse: any = {};
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = userData;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "resetLoginStatus",
        this.traceFileName
      );
    }
  }

  public async deactivatePersonalIdOTP(commonRequest: CommonRequest) {
    this.logger.info("[dao]deactivatePersonalIdOTP...start");
    try {
      let userData: any = {};
      const whereClause: any = {};
      const headers: any = commonRequest.headers;

      // Target userId
      whereClause.userId = commonRequest.params.userId;

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: ["userId", "otp"],
        raw: true,
        order: [["[createdAt]", "DESC"]],
      };
      const retUserOTP: any = await UserOTP.findOne(filter);
      if (retUserOTP && retUserOTP?.userId) {
        console.log(`Disabling otp : ${retUserOTP?.otp}`);
        const userItem: any = {
          isActive: 0,
          modifiedAt: new Date().toISOString(),
        };
        userData = await UserOTP.update(userItem, filter);
      }
      const userResponse: any = {};
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = userData;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "deactivatePersonalIdOTP",
        this.traceFileName
      );
    }
  }

  public async getUserByEmailOrUserNameOrPersonalId(
    commonRequest: CommonRequest
  ) {
    this.logger.info("getUserByEmailOrUserNameOrPersonalId...start");
    try {
      const whereClause: any = {};
      const headers: any = commonRequest.headers;
      const type: any = commonRequest.body?.type;
      const userId: any = commonRequest.body?.userId;
      const email: any = commonRequest.body?.email;
      const userName: any = commonRequest.body?.userName;
      const personalId: any = commonRequest.body?.personalId;

      // Only users with status 2 return the result
      // whereClause.status = 2;

      // Accept status 1 since we dont have yet a resource locking
      // the user cache update req status = 2
      whereClause[Op.or] = [{ status: 1 }, { status: 2 }];

      if (type) {
        whereClause.authenticationType = type;
      }
      if (userId) {
        whereClause.userId = userId;
      } else if (email) {
        whereClause.email = email;
      } else if (personalId) {
        whereClause.personalId = personalId;
      } else if (userName) {
        whereClause.userName = userName;
      } else {
        // prevent select invalid params
        whereClause.userName = "-notExist-";
      }

      const filter: any = {
        logging: console.log,
        subQuery: false,
        where: whereClause,
        attributes: [
          "userId",
          "oid",
          "personalId",
          "userName",
          "firstName",
          "lastName",
          "mobileNumber",
          "email",
          "password",
          "authenticationType",
          "isSuspended",
          "failedLoginAttempt",
          "personalDataId"
        ],
        raw: true,
      };
      const retUser: any = await User.findOne(filter);
      const userResponse: any = {};
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = retUser;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserByEmailOrUserNameOrPersonalId",
        this.traceFileName
      );
    }
  }

  // -=-=-=-=-=-=-=-=-=-=- ROLE PERMISSION REDIS SYNC -=-=-=-=-=-=-= //

  public async getPbacPermissions(commonRequest: CommonRequest) {
    this.logger.info("[getPbacPermissions]...start");
    try {
      const query: any = commonRequest.query;
      const groupBy: any[] = [
        "[Permission].[featureName]",
        "[Permission].[attributeId]",
        "[Permission].[permissionId]",
      ];
      const whereClause: any = {};
      const rpWhereClause: any = {};
      const userRoles: any[] =
        commonRequest.headers?.userRoles &&
          commonRequest.headers?.userRoles.length >= 1
          ? commonRequest.headers?.userRoles
          : [];
      const order: any = [["featureName", "ASC"]];
      const row: number = !isNaN(query.row)
        ? query.row < 1
          ? PBAC.DEFAULT.ROW
          : query.row
        : PBAC.DEFAULT.ROW;
      const page: number = !isNaN(query.page)
        ? query.page >= 1
          ? Number(query.page) - 1
          : query.page
        : 0;

      // Pagenation
      const pData = helper.getPagination(page, row, PBAC.DEFAULT.ROW);

      const since: number = Number(page);
      const limit: number = Number(row) + Number(since);
      let nextPageTarget: number | null = Number(page) + Number(row) + 1;

      // Fixed Condition Type = 1
      whereClause.type = PBAC.TYPE;
      rpWhereClause.roleId = userRoles;

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryCount, queryPermissions] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            const retpermissions: any[] = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "featureName",
                "attributeId",
                [Sequelize.fn("max", Sequelize.col("[rp].[visible]")), "v"],
                [Sequelize.fn("max", Sequelize.col("[rp].[enable]")), "e"],
              ],
              include: [
                {
                  model: RolePermission,
                  as: "rp",
                  attributes: [],
                  where: rpWhereClause,
                  required: false,
                  paranoid: false,
                },
              ],
              group: groupBy,
              where: whereClause,
            })) as PbacPermissionDto[];
            const obj: any = [
              {
                total: retpermissions.length,
              },
            ];
            resolve(obj);
          } catch (error) {
            reject(error);
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const retpermissions: any = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "featureName",
                ["attributeId", "id"],
                [Sequelize.fn("max", Sequelize.col("[rp].[visible]")), "v"],
                [Sequelize.fn("max", Sequelize.col("[rp].[enable]")), "e"],
              ],
              include: [
                {
                  model: RolePermission,
                  as: "rp",
                  attributes: [],
                  where: rpWhereClause,
                  required: false,
                  paranoid: false,
                },
              ],
              group: groupBy,
              where: whereClause,
              limit: Number(limit),
              offset: Number(since),
            })) as PbacPermissionDto[];
            resolve(retpermissions);
          } catch (error) {
            reject(error);
          }
        }),
      ]);

      const totalDataCountRaw: any[] = queryCount as [];
      const pbacPermissions: any = queryPermissions as PbacPermissionDto[];
      const totalDataCount: number =
        totalDataCountRaw.length > 0 ? totalDataCountRaw[0].total : 0;
      const pbacPermissionsResponse: CommonResponseListDto<PbacPermissionDto> =
        {};

      if (nextPageTarget >= totalDataCount) {
        nextPageTarget = null;
      }

      const maxPage: number = Math.ceil(totalDataCount / row);
      const nextPage: number | null = page + 2 > maxPage ? null : page + 2;

      pbacPermissionsResponse.page = Number(page) + 1;
      pbacPermissionsResponse.nextPage = nextPage;
      pbacPermissionsResponse.row = Number(limit);
      pbacPermissionsResponse.total = totalDataCount;
      pbacPermissionsResponse.transactionId =
        commonRequest.headers?.transactionId;
      pbacPermissionsResponse.message =
        "Successfully get list of pbac permissions";
      pbacPermissionsResponse.data = pbacPermissions;

      return pbacPermissionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getPbacPermissions",
        this.traceFileName
      );
    }
  }

  public async getRbacRolePermissions(commonRequest: CommonRequest) {
    this.logger.info("[getRbacRolePermissions]...start");
    try {
      const query: any = commonRequest.query;
      const groupBy: any[] = [
        "[Permission].[featureName]",
        "[Permission].[attributeId]",
        "[Permission].[permissionId]",
        "[Permission].[parentFeatureId]",
      ];
      const whereClause: any = {};
      const rpWhereClause: any = {};
      const roleIds: any = query?.roleIds;

      // Fixed Condition Type = 1
      whereClause.type = RBAC.TYPE;
      // User Input
      whereClause.applicationId = Number(query.appId);
      rpWhereClause.roleId = roleIds;

      // FILTER
      if (query.attributeId) {
        whereClause.attributeId = query.attributeId;
      }

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryPermissions] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            const retpermissions: any = (await Permission.findAll({
              logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "permissionId",
                "parentFeatureId",
                "featureName",
                "attributeId",
                [
                  Sequelize.fn(
                    "ISNULL",
                    Sequelize.fn("max", Sequelize.col("[rp].[active]")),
                    0
                  ),
                  "active",
                ],
              ],
              include: [
                {
                  model: RolePermission,
                  as: "rp",
                  attributes: [],
                  where: rpWhereClause,
                  required: false,
                  paranoid: false,
                },
              ],
              group: groupBy,
              where: whereClause,
            })) as RbacPermissionDto[];
            resolve(retpermissions);
          } catch (error) {
            reject(error);
          }
        }),
      ]);

      const rbacPermissions: any = queryPermissions as RbacPermissionDto[];
      const rbacPermissionsResponse: CommonResponseListDto<RbacPermissionDto> =
        {};
      rbacPermissionsResponse.transactionId =
        commonRequest.headers?.transactionId;
      rbacPermissionsResponse.message =
        "Successfully get list of rbac role permissions";
      rbacPermissionsResponse.data = rbacPermissions;

      return rbacPermissionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRbacRolePermissions",
        this.traceFileName
      );
    }
  }

  public async getRbacRolePositions(commonRequest: CommonRequest) {
    try {
      const query: any = commonRequest.query;
      const rpWhereClause: any = {};
      const roleIds: any = query?.roleIds;

      // roleId in clause
      rpWhereClause.roleId = roleIds;
      rpWhereClause.status = 2;

      // ORM SEQUELIZE QUERY PROCEDURE
      const [queryPositions] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            const retpermissions: any = (await RolePosition.findAll({
              // logging: console.log,
              subQuery: false,
              raw: true,
              attributes: [
                "[companyId]",
                "[businessUnitId]",
                "[branchId]",
                "[locationId]",
              ],
              include: [
                {
                  model: Role,
                  as: "psr",
                  attributes: [
                    ["[roleId]", "psrRoleId"],
                    ["[status]", "psrStatus"],
                  ],
                  where: { status: 2 },
                  required: true,
                  include: [
                    {
                      model: UserRole,
                      attributes: [
                        ["[roleId]", "urRoleId"],
                        ["[userId]", "urUserId"],
                        ["[status]", "urStatus"],
                      ],
                      required: true,
                      paranoid: false,
                      where: { status: 2 },
                    },
                  ],
                },
              ],
              where: rpWhereClause,
            })) as RolePositionDto[];
            resolve(retpermissions);
          } catch (error) {
            reject(error);
          }
        }),
      ]);

      const rbacPositions: any = queryPositions as RolePositionDto[];
      const rbacPositionsResponse: CommonResponseListDto<RolePositionDto> = {};
      rbacPositionsResponse.transactionId =
        commonRequest.headers?.transactionId;
      rbacPositionsResponse.message =
        "Successfully get list of rbac role positions";
      rbacPositionsResponse.data = rbacPositions;

      return rbacPositionsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getRbacRolePositions",
        this.traceFileName
      );
    }
  }

  public async createUserOTP(commonRequest: CommonRequest) {
    this.logger.info("[DAO] createUserOTP...start");
    const body = commonRequest.body;
    try {
      const userOTP: any = await UserOTP.create(body.userOTP);
      const result = userOTP.get({ plain: true });
      return result;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "createUserOTP",
        this.traceFileName
      );
    }
  }

  public async getUserRoles(commonRequest: CommonRequest) {
    this.logger.info("[getUserRoles]...start");
    try {
      const headers: any = commonRequest.headers;
      const userId: any = Number(headers.userId) || null;

      const filter: any = {
        where: {
          userId,
        },
        attributes: ["roleId"],
        raw: true,
      };
      let userRoles: any[] = [];
      userRoles = await UserRole.findAll(filter);
      const rolesResponse: any = {};
      rolesResponse.transactionId = commonRequest.headers?.transactionId;
      rolesResponse.message = "Successfully get user roles";
      rolesResponse.userRoles = userRoles;
      return rolesResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserRoles",
        this.traceFileName
      );
    }
  }

  public async generateUserRBACPBACPermissions(commonRequest: CommonRequest) {
    this.logger.info("generateUserRBACPBACPermissions...start");
    const userResponse: any = {};
    try {
      const roleIds: any[] = commonRequest.params?.roleIds;
      const groupBy: any[] = [
        "[Permission].[permissionId]",
        "[Permission].[featureName]",
        "[Permission].[type]",
        "[Permission].[attributeId]",
      ];

      const innerWhereClause: any = {};
      const allStatus: boolean = commonRequest.params?.allStatus || false;

      // Active only by default
      if (!allStatus) {
        innerWhereClause.status = 2;
      }

      const whereClause: any = {};
      const rpWhereClause: any = {
        roleId: roleIds,
      };
      const order: any = [["[Permission].[permissionId]", "ASC"]];

      const userRBACPBAC: any = await Permission.findAll({
        // logging: console.log,
        subQuery: false,
        raw: true,
        attributes: [
          "[Permission].[permissionId]",
          "[Permission].[featureName]",
          "[Permission].[type]",
          "[Permission].[attributeId]",
          [
            Sequelize.fn(
              "ISNULL",
              Sequelize.fn("max", Sequelize.col("[rp].[visible]")),
              0
            ),
            "v",
          ],
          [
            Sequelize.fn(
              "ISNULL",
              Sequelize.fn("max", Sequelize.col("[rp].[enable]")),
              0
            ),
            "e",
          ],
          [
            Sequelize.fn(
              "ISNULL",
              Sequelize.fn("max", Sequelize.col("[rp].[active]")),
              0
            ),
            "a",
          ],
        ],
        include: [
          {
            model: RolePermission,
            as: "rp",
            attributes: [],
            include: [
              {
                model: Role,
                attributes: [],
                required: true,
                paranoid: true,
                where: innerWhereClause,
              },
            ],
            where: rpWhereClause,
            required: false,
            paranoid: false,
          },
        ],
        group: groupBy,
        where: whereClause,
        order: [
          ["[type]", "ASC"],
          ["[featureName]", "ASC"],
        ],
      });
      userResponse.transactionId = commonRequest.headers?.transactionId;
      userResponse.data = userRBACPBAC;
      return userResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "generateUserRBACPBACPermissions",
        this.traceFileName
      );
    }
  }

  public async getApprovalLevelByApprovalTopicId(commonRequest: CommonRequest) {
    this.logger.info("dao getApprovalLevelByApprovalTopicId...start");
    try {
      let approvalTopicId: number = Number(
        commonRequest.query?.approvalTopicId || null
      );
      if (isNaN(approvalTopicId)) {
        approvalTopicId = 0;
      }
      const filter: any = {
        raw: true,
        attributes: ["approvalTopicId"],
        where: {
          status: RECORD_STATUS.COMPLETED,
          approvalTopicId,
        },
      };
      const ApprovalLevelData: any = await ApprovalLevel.findOne(filter);
      return ApprovalLevelData;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getApprovalLevelByApprovalTopicId",
        this.traceFileName
      );
    }
  }

  public async getAllLevelIdRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("dao getAllLevelIdRoleApproval...start");
    try {
      const roleId: number = commonRequest.params?.roleId || null;
      const filter: any = {
        attributes: ["approvalLevel"],
        where: {
          [Op.and]: [{ status: 2 }, { roleId: { [Op.ne]: roleId } }],
        },
        logging: console.log,
      };
      const ra: any = await RoleApproval.findAll(filter);
      console.log(ra);
      return ra;
    } catch (error) {
      console.log(error);
      throw applicationInsightsService.errorModel(
        error,
        "getRoleApprovalByRoleId",
        this.traceFileName
      );
    }
  }

  public async getUserByEmail(commonRequest: CommonRequest) {
    this.logger.info("dao getUserByEmail...start");
    try {
      const email: string = commonRequest.body.email;
      const filter: any = {
        raw: true,
        attributes: [
          "userId",
          "[userName]",
          "[email]",
          "[authenticationType]",
          "[isSuspended]",
          "[failedLoginAttempt]",
        ],
        where: {
          [Op.or]: [{ email }, { userName: email }],
        },
      };
      const user: any = await User.findOne(filter);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getUserByEmail",
        this.traceFileName
      );
    }
  }

  public async getUserDetail(commonRequest: CommonRequest) {
    this.logger.info("[DAO getUser]...start 1");
    try {
      const userIdParam: any = commonRequest.params.userId;
      const whereClause: any = {};
      // WHERE CONDITION
      whereClause[Op.and] = [
        {
          status: 2,
        },
      ];
      if (userIdParam) {
        whereClause[Op.and].push({ userId: userIdParam });
      }
      // Pagination
      // ORM SEQUELIZE QUERY PROCEDURE
      const [
        // queryCount,
        queryUserDetail,
      ] = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            // GET ALL USER DETAILS
            const retUserDetail: any = (await User.findAll({
              raw: true,
              nest: true,
              logging: console.log,
              subQuery: false,
              attributes: [
                [
                  Sequelize.fn(
                    "concat",
                    Sequelize.col("firstName"),
                    " ",
                    Sequelize.col("lastName")
                  ),
                  "name",
                ],
                "email",
              ],
              where: whereClause,
              include: [
                {
                  model: UserRole,
                  as: "uur",
                  attributes: [],
                  where: {
                    status: 2,
                  },
                  required: false,
                  paranoid: false,
                  include: [
                    {
                      model: Role,
                      attributes: [["name", "roleName"]],
                      required: false,
                      paranoid: false,
                    },
                  ],
                },
              ],
            })) as RoleDto[];
            resolve(retUserDetail);
          } catch (error) {
            reject(error);
          }
        }),
      ]);
      const getUserDetail: any = queryUserDetail as UserDto[];


      const roles: any = [];
      if (
        getUserDetail &&
        Array.isArray(getUserDetail) &&
        getUserDetail.length > 0
      ) {
        for (const UR of getUserDetail) {
          if (UR?.uur?.Role?.roleId) {
            roles.push(UR.uur.Role);
          }
        }
      }

      const getUserDetailDatas: any = {
        name: getUserDetail[0].name,
        email: getUserDetail[0].email,
        roles
      };
      const userDetailResponse: CommonResponseListDto<UserDto> = {};
      userDetailResponse.transactionId = commonRequest.headers?.transactionId;
      userDetailResponse.message = "Successfully get user detail";
      userDetailResponse.data = getUserDetailDatas;

      return userDetailResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "UserDetail",
        this.traceFileName
      );
    }
  }

  public async softDeleteUserOtp(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteUserOtp...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.status,
        modifiedBy: commonRequest.headers.userId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { userId: commonRequest.params.userId },
      };
      const result: any = await UserOTP.update(arrBody, filter);
      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteUserOtp",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteUserOtp",
        this.traceFileName
      );
    }
  }

  public async softDeleteUser(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteUser...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.status,
        modifiedBy: commonRequest.headers.userId,
        transactionId: commonRequest.headers.transactionId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { userId: commonRequest.body.payload.userId },
      };
      const result: any = await User.update(arrBody, filter);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteUser",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteUser",
        this.traceFileName
      );
    }
  }

  public async getDataUserById(commonRequest: CommonRequest) {
    this.logger.info("dao getDataUserById...start");
    try {
      let userId: number = Number(commonRequest.params?.userId || null);
      isNaN(userId) ? (userId = 0) : (userId = userId);
      const filter: any = {
        raw: true,
        where: {
          userId,
        },
      };
      const user: any = await User.findOne(filter);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataUserById",
        this.traceFileName
      );
    }
  }

  public async getDataUserRoleByUserId(commonRequest: CommonRequest) {
    this.logger.info("dao getDataUserRoleByUserId...start");
    try {
      let userId: number = Number(commonRequest.params?.userId || null);
      isNaN(userId) ? (userId = 0) : (userId = userId);
      const filter: any = {
        raw: true,
        where: {
          userId,
          status: 2,
        },
        attributes: ["roleId"],
      };
      const user: any = await UserRole.findAll(filter);
      return user;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataUserRoleByUserId",
        this.traceFileName
      );
    }
  }

  public async getDataRoleByRoleId(commonRequest: CommonRequest) {
    this.logger.info("dao getDataRoleByRoleId...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        where: {
          roleId,
        },
      };
      const role: any = await Role.findOne(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataRoleByRoleId",
        this.traceFileName
      );
    }
  }

  public async getDataUserRoleByRoleId(commonRequest: CommonRequest) {
    this.logger.info("dao getDataUserRoleByRoleId...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        where: {
          roleId,
          status: 2,
        },
        attributes: ["roleId"],
      };
      const role: any = await UserRole.findAll(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataUserRoleByRoleId",
        this.traceFileName
      );
    }
  }

  public async getDataRolePermissionByRoleId(commonRequest: CommonRequest) {
    this.logger.info("dao getDataRolePermissionByRoleId...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        where: {
          roleId,
          status: 2,
        },
        attributes: ["roleId"],
      };
      const role: any = await RolePermission.findAll(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataRolePermissionByRoleId",
        this.traceFileName
      );
    }
  }

  public async getDataRolePositionByRoleId(commonRequest: CommonRequest) {
    this.logger.info("dao getDataRolePositionByRoleId...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        where: {
          roleId,
          status: 2,
        },
        attributes: ["roleId"],
      };
      const role: any = await RolePosition.findAll(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataRolePositionByRoleId",
        this.traceFileName
      );
    }
  }

  public async getDataRoleApprovalByRoleId(commonRequest: CommonRequest) {
    this.logger.info("getDataRoleApprovalByRoleId...start");
    try {
      let roleId: number = Number(commonRequest.params?.roleId || null);
      isNaN(roleId) ? (roleId = 0) : (roleId = roleId);
      const filter: any = {
        raw: true,
        where: {
          roleId,
          status: 2,
        },
        attributes: ["roleId"],
      };
      const role: any = await RoleApproval.findAll(filter);
      return role;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataRoleApprovalByRoleId",
        this.traceFileName
      );
    }
  }

  public async softDeleteRole(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteRole...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.payload.status,
        modifiedBy: commonRequest.headers.userId,
        transactionId: commonRequest.headers.transactionId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { roleId: commonRequest.body.payload.roleId },
      };
      const result: any = await Role.update(arrBody, filter);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteRole",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteRole",
        this.traceFileName
      );
    }
  }

  public async softDeleteUserRole(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteUserRole...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.payload.status,
        modifiedBy: commonRequest.headers.userId,
        transactionId: commonRequest.headers.transactionId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { roleId: commonRequest.body.payload.roleId },
      };
      const result: any = await UserRole.update(arrBody, filter);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteUserRole",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteUserRole",
        this.traceFileName
      );
    }
  }

  public async softDeleteRolePermission(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteRolePermission...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.payload.status,
        modifiedBy: commonRequest.headers.userId,
        transactionId: commonRequest.headers.transactionId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { roleId: commonRequest.body.payload.roleId },
      };
      const result: any = await RolePermission.update(arrBody, filter);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteRolePermission",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteRolePermission",
        this.traceFileName
      );
    }
  }

  public async softDeleteRolePosition(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteRolePosition...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.payload.status,
        modifiedBy: commonRequest.headers.userId,
        transactionId: commonRequest.headers.transactionId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { roleId: commonRequest.body.payload.roleId },
      };
      const result: any = await RolePosition.update(arrBody, filter);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteRolePosition",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteRolePosition",
        this.traceFileName
      );
    }
  }

  public async softDeleteRoleApproval(commonRequest: CommonRequest) {
    this.logger.info("[DAO] softDeleteRoleApproval...start");
    try {
      const arrBody: any = {
        status: commonRequest.body.payload.status,
        modifiedBy: commonRequest.headers.userId,
        transactionId: commonRequest.headers.transactionId,
        modifiedAt: new Date().toISOString(),
      };
      const filter: any = {
        where: { roleId: commonRequest.body.payload.roleId },
      };
      const result: any = await RoleApproval.update(arrBody, filter);

      return result;
    } catch (error) {
      const err: any = error;
      if (err?.name === "SequelizeUniqueConstraintError") {
        const errModel: any = {
          code: 400,
          message: "SequelizeUniqueConstraintError",
          appInsightRaw: error,
        };
        throw applicationInsightsService.errorModel(
          errModel,
          "softDeleteRoleApproval",
          this.traceFileName
        );
      }
      throw applicationInsightsService.errorModel(
        error,
        "softDeleteRoleApproval",
        this.traceFileName
      );
    }
  }

  public async getLevelIdsByTopicIds(topicIds: any) {
    this.logger.info("[dao].[getLevelIdsByTopicIds]...topicIds:", topicIds);
    try {
      const filter: any = {
        where: {
          status: RECORD_STATUS.COMPLETED,
          approvalTopicId: {
            [Op.in]: topicIds,
          },
        },
        logging: console.log,
        attributes: ["approvalLevelId"],
        raw: true,
      };
      let ApprovalLevels: any[] = [];
      ApprovalLevels = await ApprovalLevel.findAll(filter);
      const levelsResponse: any = {};
      levelsResponse.message = "Successfully get getLevelIdsByTopicIds ";
      levelsResponse.ApprovalLevels = ApprovalLevels;
      return levelsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getLevelIdsByTopicIds",
        this.traceFileName
      );
    }
  }

  public async getDataTopicByTopicIds(topicIds: any) {
    this.logger.info("[dao].[getDataTopicByTopicIds]...topicIds:", topicIds);
    try {
      const filter: any = {
        where: {
          status: RECORD_STATUS.COMPLETED,
          approvalTopicId: {
            [Op.in]: topicIds,
          },
        },
        logging: console.log,
        attributes: ["approvalTopicId"],
        raw: true,
      };
      let ApprovalTopics: any[] = [];
      ApprovalTopics = await ApprovalTopic.findAll(filter);
      const topicsResponse: any = {};
      topicsResponse.message = "Successfully get getLevelIdsByTopicIds ";
      topicsResponse.ApprovalTopics = ApprovalTopics;
      return topicsResponse;
    } catch (error) {
      throw applicationInsightsService.errorModel(
        error,
        "getDataTopicByTopicIds",
        this.traceFileName
      );
    }
  }
}
