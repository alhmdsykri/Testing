
export abstract class AuditClass<T extends {
  createdBy: number, createdAt: string,
  modifiedBy?: number | null | undefined, modifiedAt?: string | null | undefined,
  createdAtSap?: string | null | undefined, modifiedAtSap?: string | null | undefined,
  version?: number | null | undefined,
  transactionId?: string | null | undefined,
  dataStoreTime?: string | null | undefined,
  sapMssqlSinkTime?: string | null | undefined }> {

  private createdBy: number = 0;
  private createdAt: string = "";
  private modifiedBy: number | null | undefined = 0;
  private modifiedAt: string | null | undefined  = "";
  private createdAtSap: string | null | undefined  = "";
  private modifiedAtSap: string | null | undefined  = "";
  private version: number | null | undefined = 0;
  private transactionId: string | null | undefined  = "";
  private dataStoreTime: string | null | undefined  = "";
  private sapMssqlSinkTime: string | null | undefined  = "";


  public setParentSource(data: T) {
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.modifiedBy = data.modifiedBy;
    this.modifiedAt = data.modifiedAt;
    this.createdAtSap = data.createdAtSap;
    this.modifiedAtSap = data.modifiedAtSap;
    this.version = data.version
    this.transactionId = data.transactionId;
    this.dataStoreTime = data.dataStoreTime;
    this.sapMssqlSinkTime = data.sapMssqlSinkTime;
  }

  public addAuditAttribute(data: any) {
    data.createdBy = this.createdBy;
    data.createdAt = this.createdAt;
    data.modifiedBy = this.modifiedBy;
    data.modifiedAt = this.modifiedAt;
    data.createdAtSap = this.createdAtSap;
    data.modifiedAtSap = this.modifiedAtSap;
    data.version = this.version
    data.transactionId = this.transactionId;
    data.dataStoreTime = this.dataStoreTime;
    data.sapMssqlSinkTime = this.sapMssqlSinkTime;
    return data;
  }
}


