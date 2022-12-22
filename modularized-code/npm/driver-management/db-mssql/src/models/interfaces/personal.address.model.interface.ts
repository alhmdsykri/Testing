export interface PersonalAddressAttribute {
  personalAddressId: number,
  personalDataId: number,
  identityTypeId: number,
  addressTypeCode:number,
  cityId:number,
  addressDetail: string,
  postalCode?: number,
  phoneNumber?: string,
  contactName?:string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version?: number
};