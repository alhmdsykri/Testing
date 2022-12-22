import { MaterialAttributes } from "../models/interface/material.attributes.interface"
export interface MaterialDeltaSink extends MaterialAttributes {
  entity?: string;
  action?: string;
}

