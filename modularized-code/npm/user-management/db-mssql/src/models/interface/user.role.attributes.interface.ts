export interface UserRoleAttributes {
  userRoleId: number,
  userId: number,
  roleId: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  uniqueKey: string,
  version: number
};
