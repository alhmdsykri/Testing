import { CustomerContactAttributes } from "../models/interface/customer.contact.attributes.interface"
export interface CustomerContactDeltaSink extends CustomerContactAttributes {
  entity?: string;
  action?: string;
}

