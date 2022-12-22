export interface PersonalMCUAttribute {
  personalMCUId: number,
  personalDataId: number,
  mcuTypeResultId: number,
  healthFacility: string,
  mcuDate: string,
  mcuExpirationDate: string,
  mcuStatus: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};