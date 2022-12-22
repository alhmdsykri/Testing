export interface CustomerContactAttributes {
  customerContactId: number,
  customerId: number,
  customerContactCode: string,
  contactName: string
  phoneNumber: string
  email: string,
  position: string,
  department: string,
  remarks: string,
  isPIC: boolean,
  function: string,
  status: number,
  uniqueKey: number,
  version: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  transactionId?: string,
  persistedDate?: string
  dataStoreTime?: string
  sapMssqlSinkTime?: string,
};
