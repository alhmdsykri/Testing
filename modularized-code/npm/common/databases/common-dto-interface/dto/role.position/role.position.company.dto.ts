import { RolePositionBusinessUnit } from "./role.position.business.unit.dto";
export class RolePositionCompanyDto {
  public companyId?: number;
  public code?: string;
  public name?: string;
  public businessUnits?: RolePositionBusinessUnit[] = [];
}
