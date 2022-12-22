import { applicationInsightsService } from "astrafms-services-error-logging";
import * as stackTrace from "stack-trace";
import { User } from "../models/user.model";
import { UserRole } from "../models/user.role.model";
import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";
import { RolePermission } from "../models/role.permission.model";
import { RolePosition } from "../models/role.position.model";
import { UserOTP } from "../models/user.otp.model";
import { Application } from "../models/application.model";
import { sequelize } from "./database";
import { RoleApproval } from "../models/role.approval.model";
import { ApprovalTopic } from "../models/approval.topic.model";
import { ApprovalLevel } from "../models/approvel.level.model";

class Sequelizer {

  private trace: any;
  private traceFileName: any;

  constructor() {
    this.trace = stackTrace.get();
    this.traceFileName = this.trace[0].getFileName();
  }

  public async sync() {
    try {
      // initialize models
      // const models = {
      //   role: Role,
      //   rolePermission: RolePermission,
      //   permission: Permission
      // };

      // Associate Tables and create Foreign key
      // onDelete: "CASCADE" - when the vehicle was deleted, the child fk will set to null
      if (Object.keys(User.associations).length === 0 && Object.keys(Permission.associations).length === 0 && Object.keys(ApprovalTopic.associations).length === 0 && Object.keys(RoleApproval.associations && Object.keys(ApprovalLevel.associations).length === 0).length === 0) {
        User.hasMany(UserRole,
          { foreignKey: "userId", sourceKey: "userId", as: "uur" },
        );
        UserRole.belongsTo(User,
          {
            foreignKey: "userId", targetKey: "userId" as "uru"
          }
        );
        UserRole.belongsTo(Role,
          {
            foreignKey: "roleId", targetKey: "roleId" as "urr"
          }
        );

        Role.hasMany(UserRole,
          { foreignKey: "roleId", sourceKey: "roleId" as "rur" },
        );
        Role.hasMany(RolePosition,
          { foreignKey: "roleId", sourceKey: "roleId" as "rps" },
        );
        Permission.hasMany(RolePermission,
          { foreignKey: "permissionId", sourceKey: "permissionId", as: "rp" },
        );
        Application.hasMany(Permission,
          { foreignKey: "applicationId", sourceKey: "applicationId", as: "ap" },
        );


        RoleApproval.hasMany(ApprovalTopic,
          { foreignKey: "approvalTopicId", sourceKey: "approvalId", as: "AT" }
        );
        RoleApproval.hasMany(ApprovalLevel,
          { foreignKey: "approvalLevelId", sourceKey: "approvalLevel", as: "AL" }
        );


        RolePermission.belongsTo(Role,
          { foreignKey: "roleId", targetKey: "roleId" as "rpr" }
        );
        RolePermission.belongsTo(Permission,
          { foreignKey: "permissionId", targetKey: "permissionId", as: "rpp" }
        );
        RolePosition.belongsTo(Role,
          { foreignKey: "roleId", targetKey: "roleId", as: "psr" }
        );
        Permission.belongsTo(Application,
          { foreignKey: "applicationId", targetKey: "applicationId" as "pa" }
        );

        // Create the table
        const db = await sequelize.sync();
        // Alter the table
        // await sequelize.sync({alter: true});
      }
    } catch (error) {
      console.log("@@ error => ", error)
      throw applicationInsightsService.errorModel(error, "sequelizeSync", this.traceFileName);
    }
  }
}

export const sequelizer = new Sequelizer();