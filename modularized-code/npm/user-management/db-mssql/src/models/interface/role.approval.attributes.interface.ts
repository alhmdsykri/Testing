export interface RoleApprovalAttributes {
  roleApprovalId: string,
  approvalId: string,
  roleId: string,
  approvalLevel: number,
  isSegatedDuty: boolean,
  status: number,
  createdBy: string,
  createdAt: string,
  modifiedBy?: string,
  modifiedAt?: string,
  version: number
};