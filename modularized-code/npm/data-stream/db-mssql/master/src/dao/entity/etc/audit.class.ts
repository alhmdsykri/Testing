
export abstract class AuditClass<T extends {
  createdBy: number, createdAt: string,
  modifiedBy?: number | null | undefined, modifiedAt?: string | null | undefined,
  transactionId?: string | null | undefined,
  dataStoreTime?: string | null | undefined,
  sapMssqlSinkTime?: string | null | undefined }> {

  private createdBy: number = 0;
  private createdAt: string = "";
  private modifiedBy: number | null | undefined = 0;
  private modifiedAt: string | null | undefined  = "";
  private transactionId: string | null | undefined  = "";
  private dataStoreTime: string | null | undefined  = "";
  private sapMssqlSinkTime: string | null | undefined  = "";


  public setParentSource(data: T) {
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.modifiedBy = data.modifiedBy;
    this.modifiedAt = data.modifiedAt;
    this.transactionId = data.transactionId;
    this.dataStoreTime = data.dataStoreTime;
    this.sapMssqlSinkTime = data.sapMssqlSinkTime;
  }

  public addAuditAttribute(data: any) {
    data.createdBy = this.createdBy;
    data.createdAt = this.createdAt;
    data.modifiedBy = this.modifiedBy;
    data.modifiedAt = this.modifiedAt;
    data.transactionId = this.transactionId;
    data.dataStoreTime = this.dataStoreTime;
    data.sapMssqlSinkTime = this.sapMssqlSinkTime;
    return data;
  }
}


