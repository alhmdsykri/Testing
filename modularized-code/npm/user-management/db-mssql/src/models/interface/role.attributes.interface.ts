export interface RoleAttributes {
  roleId?: number,
  name: string,
  status: number,
  isSuperAdmin: boolean,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  uniqueKey: string,
  version: number,
  transactionId: string
};
