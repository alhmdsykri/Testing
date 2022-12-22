export interface PersonalContractAttribute {
  personalDataId: number,
  contractTypeCode: number,
  contractStart: string,
  contractEnd: string,
  terminationDate?: string | null,
  contractStatus: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number | null,
  modifiedAt?: string | null,
  version: number
};