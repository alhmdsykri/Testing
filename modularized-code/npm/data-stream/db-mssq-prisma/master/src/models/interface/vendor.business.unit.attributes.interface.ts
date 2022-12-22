export interface VendorBusinessUnitAttributes {
  vendorBusinessUnitId: number,
  vendorId: number,
  businessUnitId: number,
  businessUnitCode: string,
  isBlocked: boolean,
  status: number,
  uniqueKey?: string,
  version?: number,
  createdBy?: number,
  createdAt?: string,
  modifiedBy?: number,
  modifiedAt?: string,
  transactionId?: string,
  persistedDate?: string
  dataStoreTime?: string
  sapMssqlSinkTime?: string
};
