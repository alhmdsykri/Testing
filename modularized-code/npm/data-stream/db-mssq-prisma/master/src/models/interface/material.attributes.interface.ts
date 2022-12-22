export interface MaterialAttributes {
  materialId: number,
  materialCode: string
  materialName: string,
  serviceTypeId?: number,
  UOMCode?: number
  vehicleTypeId: number,
  vehicleTypeCode: string,
  vehicleTypeName: string,
  rentalDuration: number,
  rentalDurationType: string,
  isSLITrucking: boolean,
  productId?: number,
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
