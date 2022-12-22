export interface MaterialItemAttributes {
  materialItemId: number,
  materialId: number,
  branchId: number,
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
