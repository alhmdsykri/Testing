export interface VendorAttributes {
  vendorId: number,
  vendorName: string,
  vendorCode: string,
  isBlocked?: string,
  status: number,
  uniqueKey?: string,
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
