import { MaterialItemAttributes } from "../models/interface/material.item.attributes.interface"
export interface MaterialItemDeltaSink extends MaterialItemAttributes {
  entity?: string;
  action?: string;
}

