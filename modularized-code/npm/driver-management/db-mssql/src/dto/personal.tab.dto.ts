export class PersonalIdentityDto {
  public personalDataId?: number;
  public gender?: string;
  public placeOfBirth?: string;
  public dateOfBirth?: string;
  public religion?: string;
  public height?: string;
  public weight?: string;
  public bloodType?: string;
  public shoeSize?: string;
  public pantsSize?: string;
  public uniformSize?: string;
  public nationality?: string;
  public nationalityId?: number;
  public genderId?: number;
  public religionId?: number;
  public maritalStatusId?: number;
  public maritalStatus?: string;
}

export class PersonalAddressDto {
  public personalDataId?: number;
  public addressType?: string;
  public addressDetail?: string;
  public city?: string;
  public province?: string;
  public country?: string;
  public contactName?: string;
  public phoneNumber?: string;
  public postalCode?: string;
}

// tslint:disable-next-line:max-classes-per-file
export class PersonalEducationsDto {
  public personalDataId?: number;
  public educationlevel?: string;
  public schoolName?: string;
  public startDate?: string;
  public endDate?: string;
}
export class PersonalFamiliesDto {
  public personalDataId?: number;
  public name?: string;
  public gender?: string;
  public genderId?: number;
  public relation?: string;
  public profession?: string;
  public placeofBirth?: string;
  public dateOfBirth?: string;
  public nik?: string;
}
