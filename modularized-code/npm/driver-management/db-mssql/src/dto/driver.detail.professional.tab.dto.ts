export class DriverDetailProfessionalTabDto {
  public personalDataId?: number;
  public placementCard?: PlacementCardDto;
  public employmentCard?: EmploymentCardDto;
  public contactCard?: ContactCardDto;
  public workingExperienceCard?: WorkingExperienceCardDto[];
}

export class PlacementCardDto {
  public businessUnitId?: number;
  public businessUnitCode?: string;
  public businessUnitName?: string;
  public branchId?: number;
  public branchCode?: string;
  public branchName?: string;
  public poolId?: number;
  public poolCode?: string;
  public poolName?: string;
  public customerCode?: string;
  public customerName?: string;
}

export class CustomerPICModel {
  public role?: string;
  public name?: string;
}

export class EmploymentCardDto {
  public contractType?: string;
  public contractStart?: string;
  public contractEnd?: string;
  public contractStatus?: string;
  public joinDate?: string;
  public bankName?: string;
  public bankAccountNumber?: number;
  public bankAccountName?: string;
  public isInternal?: boolean;
}

export class ContactCardDto {
  public phoneNumber?: string;
  public email?: string;
}

export class WorkingExperienceCardDto {
  public company?: string;
  public position?: string;
  public unitTypeCode?: string;
  public unitType?: string;
  public startDate?: string;
  public startEnd?: string;
}
