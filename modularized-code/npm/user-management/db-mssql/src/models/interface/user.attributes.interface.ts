export interface UserAttributes {
  userId: number,
  oid: string,
  userName: string,
  email: string
  personalId: string
  firstName: string,
  lastName: string,
  status: number,
  authenticationType: number,
  password: string,
  failedLoginAttempt: number,
  isSuspended: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version: number
};
