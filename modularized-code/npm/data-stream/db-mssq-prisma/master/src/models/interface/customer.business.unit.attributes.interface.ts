export interface CustomerBusinessUnitAttributes {
  customerBusinessUnit: number,
  customerId: number,
  businessUnitId: number,
  businessUnitCode?: string,
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
