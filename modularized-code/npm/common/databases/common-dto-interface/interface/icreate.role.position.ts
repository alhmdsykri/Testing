
export interface IRolePositionLocation {
  locationId: number,
  code: string,
  name: string
}

export interface IRolePositionBranch {
  branchId: number,
  code: string,
  name: string,
  locations: IRolePositionLocation[]
}

export interface IRolePositionBusinessUnit {
  businessUnitId: number,
  code: string,
  name: string,
  branches: IRolePositionBranch[]
}

export interface IRolePositionCompany {
  companyId: number,
  code: string,
  name: string,
  businessUnits: IRolePositionBusinessUnit[]
}

export interface IRequestCreateRolePosition {
  roleId: string,
  companies: IRolePositionCompany[]
}
