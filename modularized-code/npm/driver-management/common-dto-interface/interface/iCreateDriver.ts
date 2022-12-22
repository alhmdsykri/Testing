export interface IRequestCreateDriver {
  generalInformation: GeneralInformationModel,
  professionalBackground: ProfessionalBackgroundModel,
  personalInformation: PersonalInformationModel,
  documents: DocumentsModel[]
}

export interface GeneralInformationModel {
  photoFront?: string,
  photoRight?: string,
  photoLeft?: string,
  fullName: string,
  personalId: string,
  companyId: number,
  companyCode?: string,
  companyName?: string,
  personnelAreaId: number,
  personnelAreaCode?: string,
  personnelAreaName?: string,
  cicoPool: CicoPoolModel[]
}

export interface CicoPoolModel {
  cicoPoolId: number,
  cicoPoolCode: string,
  cicoPoolName: string
}

export interface ProfessionalBackgroundModel {
  businessUnitId: number,
  businessUnitCode?: string,
  businessUnitName?: string,
  branchId: number,
  branchCode?: string,
  branchName?: string,
  poolId: number,
  poolCode?: string,
  poolName?: string,
  customerId: number,
  customerCode?: string,
  customerName?: string,
  customerPosition?: string,
  picCoordinatorRoleId?: number,
  picCoordinatorRoleName?: string,
  picCustomerRole?: string,
  contractTypeCode: string,
  contractStart: string,
  contractEnd: string,
  joinedDate: string,
  bankId: number,
  bankAccountNumber: string,
  bankAccountHoldername: string,
  phoneNumber: string,
  email: string,
  cicoPools: number[]
}

export interface PersonalInformationModel {
  genderId: number,
  nationalityId: number,
  placeOfBirth: string,
  dateOfBirth: string,
  maritalStatusId: number,
  maritalDate?: string,
  religionId: number,
  height?: number,
  weight?: number,
  bloodType?: string,
  shoeSize?: string,
  pantsSize?: string,
  uniformSize?: string
}

export interface DocumentsModel {
  identityTypeId: number,
  identityNumber: string,
  expirationDate: string,
  identityAttachment?: string
}
