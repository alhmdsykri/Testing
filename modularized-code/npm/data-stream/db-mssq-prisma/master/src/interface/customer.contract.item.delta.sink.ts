import { CustomerContractItemAttributes } from "../models/interface"
export interface CustomerContractItemDeltaSink extends CustomerContractItemAttributes {
  entity?: string;
  action?: string;
}

