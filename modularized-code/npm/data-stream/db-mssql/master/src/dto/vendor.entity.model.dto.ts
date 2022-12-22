import { VendorAttributes, VendorBusinessUnitAttributes} from "../models/interface/index"
export class VendorEntityModelDto {
  public vendor?: VendorAttributes;
  public businessUnit?: VendorBusinessUnitAttributes[];
}
