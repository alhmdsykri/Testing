export interface PermissionAttributes {
  permissionId: string,
  applicationId: number,
  featureName: string,
  parentFeatureId: string,
  type: number,
  attributeId: number,
  status: number,
  createdBy: number,
  createdAt: string,
  modifiedBy?: number,
  modifiedAt?: string,
  version: number
};

