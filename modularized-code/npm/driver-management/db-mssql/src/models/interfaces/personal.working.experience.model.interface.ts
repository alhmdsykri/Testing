export interface PersonalWorkingExperienceAttribute {
  personalWorkingExperienceId: number,
  personalDataId: number,
  companyName: string,
  workingStart: string,
  workingEnd: string,
  vehicleTypeCode?: string,
  vehicleTypeName?: string,
  isDriverExperience: string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};