import { User } from "./user";

export class UserResponseDto {
    public code?: number;
    public total?: number;
    public limit?: number;
    public since?: number;
    public transactionId?: string;
    public vehicleDrivers?: User[] | [];
}
