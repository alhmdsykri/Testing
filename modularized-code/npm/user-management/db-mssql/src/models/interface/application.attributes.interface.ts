export interface ApplicationAttributes {
  applicationId?: number,
  name: string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  uniqueKey: string,
  version: number
};
