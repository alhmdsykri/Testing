import { CustomerBusinessUnitAttributes } from "../models/interface/customer.business.unit.attributes.interface"
export interface CustomerBusinessUnitDeltaSink extends CustomerBusinessUnitAttributes {
  entity?: string;
  action?: string;
}

