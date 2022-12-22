import { RolePositionBranchDto } from "./role.position.branch.dto";
export class RolePositionBusinessUnit {
  public businessUnitId?: number;
  public code?: string;
  public name?: string;
  public branches?: RolePositionBranchDto[] = [];
}
