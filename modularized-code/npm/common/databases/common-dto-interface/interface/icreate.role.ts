export interface IPermissions {
  permissionId: number,
  visible: number,
  enable: number,
  active: number
}

export interface ICreateRole {
  name: string,
  isSuperAdmin?: boolean,
  permissions: IPermissions[]
}

export interface IRequestPermissions {
/**
* @isInt
* @default 1
*/
  permissionId: number,
  v: number,
  e: number,
  a: number
}

export interface IRequestCreateRole {
  name: string,
  permissions: IRequestPermissions[]
}
