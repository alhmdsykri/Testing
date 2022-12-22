export interface PersonalFamilyAttribute {
  personalFamilyId: number,
  personalDataId: number,
  relationTypeCode: number,
  genderId:number,
  FullName:number,
  placeOfBirth: string,
  dateOfBirth?: number,
  identityNumber?: string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};