import { CustomerContractItemAttributes} from "../models/interface/index"
export class CustomerContractItemEntityModelDto {
  public entity?: string;
  public action?: string;
  public transactionId?: string;
  public customerContractItem?: CustomerContractItemAttributes[] | [];
}
