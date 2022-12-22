import { RolePositionLocationDto } from "./role.position.location.dto";
export class RolePositionBranchDto {
  public branchId?: number;
  public code?: string;
  public name?: string;
  public locations?: RolePositionLocationDto[] = [];
}
