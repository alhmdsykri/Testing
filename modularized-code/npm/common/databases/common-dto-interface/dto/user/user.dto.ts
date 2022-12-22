export class UserDto {
  public userId?: number;
  public oid?: string;
  public userName?: string;
  public email?: string;
  public nrp?: string;
  public mobileNumber?: string;
  public fisrtName?: string;
  public lastName?: string;
  public status?: number;
  public authenticationType?: number;
  public password?: string;
  public isSuspended?: boolean;
  public failedLoginAttempt?: number;
  public createdAt?: string;
  public createdBy?: number
  public modifiedAt?: string;
  public modifiedBy?: number;
  public uniqueKey?: string;
  public version?: number;
  public transactionId?: string;
}
