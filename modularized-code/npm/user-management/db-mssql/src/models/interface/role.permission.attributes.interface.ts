export interface RolePermissionAttributes {
  rolePermissionId?: number,
  roleId: number,
  permissionId: number,
  visible: number,
  enable: number,
  active: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  uniqueKey: string,
  version: number
};
