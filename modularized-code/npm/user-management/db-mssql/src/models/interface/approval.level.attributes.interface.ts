export interface ApprovalLevelAttributes {
  approvalLevelId: number,
  approvalTopicId: number,
  name: string,
  description: string
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version: number
};
