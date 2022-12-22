export interface CustomerAttributes {
  customerId: number,
  customerCode: string,
  customerName: string,
  customerAddress: string
  accountGroupSAP: string
  isBlocked: boolean,
  isB2B: boolean,
  customerLogo: string,
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
