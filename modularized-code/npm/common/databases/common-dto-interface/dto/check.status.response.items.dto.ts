export class CheckStatusResponseItemsDto<T> {
  public transactionId?: string;
  public code?: number;
  public message?: string;
  public status?:boolean;
  public data?: T[] = [];
}