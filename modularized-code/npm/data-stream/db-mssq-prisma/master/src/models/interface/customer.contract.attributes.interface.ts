// Interface use for Types
export interface CustomerContractAttributes {
  customerContractId: number,
  contractNumber: string,
  parentContractId?: number,
  companyId?: number,
  companyCode?: string,
  companyName?: string
  businessUnitId: number
  businessUnitCode: string,
  businessUnitName: string,
  customerId: number,
  startDate: string,
  endDate: string,
  customerContractStatus: number,
  remainingKm: number,
  remainingTonnage: number,
  remainingTrip: number,
  isProject: boolean,
  isMonthly?: boolean,
  isTMS: boolean,
  isOvercharge?: boolean,
  status?: number,
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

