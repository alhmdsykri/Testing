export interface RolePositionDetailsAttributes {
  rolePermissionDetailsId: string,
  roleId: string,
  positionId: string,
  companyId: string,
  companyName: string,
  businessUnitId: string,
  businessUnitName: string,
  branchId: string,
  branchName: string,
  locationId: string,
  locationName: string,
  status: number,
  createdBy: string,
  createdAt: string,
  modifiedBy?: string,
  modifiedAt?: string,
  version: number
};
