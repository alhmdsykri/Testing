export interface AbilityAttribute {
  abilityId: number,
  abilityTypeId: number,
  abilityName: string,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string
};