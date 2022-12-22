export class IsReadyModifyResponseDto {
  public code?: number;
  public transactionId?: string;
  public status?: boolean;
  public message?: string;
  public data?: any;

  constructor(code: number, transactionId: string, status: boolean, message?: string, data?: any) {
    this.code = code;
    this.transactionId = transactionId;
    this.status = status,
      this.message = message,
      this.data = data
  }

}