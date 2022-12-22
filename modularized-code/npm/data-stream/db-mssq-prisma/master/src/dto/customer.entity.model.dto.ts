import { CustomerAttributes, CustomerBusinessUnitAttributes, CustomerContactAttributes} from "../models/interface/index"
export class CustomerEntityModelDto {
  public customer?: CustomerAttributes;
  public customerBusinessUnit?: CustomerBusinessUnitAttributes[] | [];
  public customerContact?: CustomerContactAttributes[] | [];
}
