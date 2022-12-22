export class DriverDetailDto {
  public personalDataId?: number;
  public personalId?: number;
  public nrp?: number;
  public fullName?: string;
  public personnelAreaCode?: string;
  public personnelAreaName?: string;
  public companyCode?: string;
  public companyName?: string;
  public cicoPool?: CiCoPoolDto[];
}

export class CiCoPoolDto {
  public cicoPoolId?: number;
  public cicoPoolCode?: string;
  public cicoPoolName?: string;
}
