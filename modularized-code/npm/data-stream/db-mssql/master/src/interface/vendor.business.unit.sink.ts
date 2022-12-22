import { VendorBusinessUnitAttributes } from "../models/interface/vendor.business.unit.attributes.interface"
export interface VendorBusinessUnitDeltaSink extends VendorBusinessUnitAttributes {
  entity?: string;
  action?: string;
}

