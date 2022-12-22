import { DriverDto } from "./driver.dto";

export class DriversResponseDto {
    public code?: number;
    public total?: number;
    public limit?: number;
    public since?: number;
    public transactionId?: string;
    public drivers?: DriverDto[] | [];
}
