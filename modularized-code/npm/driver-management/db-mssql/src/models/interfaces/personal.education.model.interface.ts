export interface PersonalEducationAttribute {
  personalEducationId: number,
  educationTypeCode: string,
  startDate: string,
  endDate:string,
  schoolName:string,
  programStudy: string,
  branchOfStudy?: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};