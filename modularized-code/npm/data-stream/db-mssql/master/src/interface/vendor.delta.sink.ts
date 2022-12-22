import { VendorAttributes } from "../models/interface/vendor.attributes.interface"
export interface VendorDeltaSink extends VendorAttributes {
  entity?: string;
  action?: string;
}

