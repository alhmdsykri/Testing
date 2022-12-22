import { CustomerContractAttributes } from "../models/interface/"
export interface CustomerContractDeltaSink extends CustomerContractAttributes {
  entity?: string;
  action?: string;
}

