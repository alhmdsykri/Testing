export class CommonMessageServiceBus {
  public method!: string;
  public transactionId!: string;
  public userId!: number;
  public source!: string;
  public status!: number;
  public action!: string;
  public filter!: string;
  public payload: any;
  public retryStartTime?: string;
  public retryEndTime?: string;
}