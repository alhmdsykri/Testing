export interface MaterialAttributes {
  materialId: number,
  serviceTypeId?: number,
  productId?: number,
  UOMCode?: string
  materialCode: string
  materialName: string,
  vehicleTypeId: number,
  vehicleTypeCode: string,
  vehicleTypeName: string,
  rentalDuration: number,
  rentalDurationType: string,
  isSLITrucking: boolean,
  businessUnitId?: number,
  businessUnitCode?: string,
  businessUnitName?: string,
  status: number,
  uniqueKey: string,
  version: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  transactionId?: string,
  persistedDate?: string
  dataStoreTime?: string
  sapMssqlSinkTime?: string
};
