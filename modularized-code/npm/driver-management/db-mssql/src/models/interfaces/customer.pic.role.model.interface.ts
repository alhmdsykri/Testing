export interface CustomerPICRoleAttribute {
  customerPICRoleId: number,
  personalCustomerPICId: number,
  userRoleId: number,
  userRoleName: string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};