export interface IPermissions {
  permissionId: number,
  visible: boolean,
  enable: boolean,
  active: boolean
}

export interface IUpdateRole {
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

export interface IRequestUpdateRole {
  name: string,
  permissions: IRequestPermissions[]
}

