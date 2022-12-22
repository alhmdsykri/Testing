export interface RolePositionAttributes {
  rolePositionId?: number,
  roleId: number,
  companyId: number,
  companyCode: string,
  companyName: string,
  businessUnitId: number,
  businessUnitCode: string,
  businessUnitName: string,
  branchId: number,
  branchCode?: string,
  branchName?: string,
  locationId: number,
  locationCode: string
  locationName: string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  uniqueKey: string,
  version: number
};
