export class PrismaErrorModel {
  public errorInstance: any;
  public errorCode?: any;
  public meta?: any;
  public message?: any;
  public name?: any;
  public stack?: any;
  public isErrorForResend?: boolean

  constructor(errorInstrance?: any, name?: any, errorCode?: any, message?: any, meta?: any, isErrorForResend?: boolean, stack?: any) {
      this.errorInstance = errorInstrance;
      this.name = name;
      this.errorCode = errorCode;
      this.message = message;
      this.meta = meta;
      this.isErrorForResend = isErrorForResend;
      this.stack = stack;
  }
}