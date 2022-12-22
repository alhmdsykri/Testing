export class CommonResponseListDto<T> {
  public transactionId?: string;
  public code?: number;
  public message?: string;
  public page?: number;
  public row?: number;
  public nextPage?: number | null;
  public total?: number;
  public data?: T[] = [];
}