export interface UpdatePersonalContract {
  personalDataId: number,
  personalContractId: number,
  contractStart: string
  contractEnd: string,
  expiresOn: number,
  contractStatus: number,
  isInternal: boolean
}
