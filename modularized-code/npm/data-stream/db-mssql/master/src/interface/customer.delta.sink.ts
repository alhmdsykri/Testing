import { CustomerAttributes } from "../models/interface/customer.attributes.interface"
export interface CustomerDeltaSink extends CustomerAttributes {
  entity?: string;
  action?: string;
}

