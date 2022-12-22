export interface PersonalIdentityAttribute {
  personalDataId: number,
  identityTypeId: number,
  identityAccountNumber: string,
  identityAccountName?: string,
  identityValidTo?: string,
  status: number,
  identityStatus: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};