import { CiCoPoolDto } from "./driver.detail.dto";

export class DriverDetailDto {
    public personalDataId?: number;
    public personalId?: number;
    public nrp?: number;
    public fullName?: string;
    public personnelAreaId?: number;
    public personnelAreaCode?: string;
    public personnelAreaName?: string;
    public companyId?: number;
    public companyCode?: string;
    public companyName?: string;
    public cicoPool?: CiCoPoolDto[];
    public isInternal?: boolean;
}
