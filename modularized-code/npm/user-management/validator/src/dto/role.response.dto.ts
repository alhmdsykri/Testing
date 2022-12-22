import { RoleDto } from "./role.dto";

export class RoleResponse{
    public code?: number;
    public total?: number;
    public limit?: number;
    public since?: number;
    public transactionId?: string;
    public roles?: RoleDto[] | [];
}
