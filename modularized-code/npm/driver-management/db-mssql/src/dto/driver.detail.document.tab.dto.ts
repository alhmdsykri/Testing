export class DriverDetailDocumentTabDto {
  public documentCard?: DocumentCardDto[];
  public medicalCheckUpCard?: MedicalCheckUpCardDto[];
}

export class DocumentCardDto {
  public personalIdentityId?: number;
  public identityTypeId?: string;
  public identityTypeName?: string;
  public identityAccountNumber: string | null | undefined;
  public identityExpirationDate: string | null | undefined;
  public status?: string;
  public statusId?: number;
  public attachment: string | null | undefined;
}

export class MedicalCheckUpCardDto {
  public personalMCUId?: number;
  public mcuTypeResultId?: number;
  public mcuTypeResultDetail?: string;
  public healthFacility?: string;
  public mcuDate?: string;
  public mcuExpirationDate?: string;
  public status?: string;
  public statusId?: number;
  public attachment?: string | null | undefined;
}