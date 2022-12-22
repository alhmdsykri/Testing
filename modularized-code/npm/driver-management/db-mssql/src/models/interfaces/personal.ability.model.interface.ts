export interface PersonalAbilityAttribute {
  personalAbilityId: number,
  personalDataId: number,
  abilityId: number,
  score: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string
};