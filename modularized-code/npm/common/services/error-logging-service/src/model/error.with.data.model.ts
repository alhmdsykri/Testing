export class ErrorWithDataModel {
    public code?: number | null;
    public transactionId?: string | null;
    public message?: any | null;
    public data?: any | null;


    constructor(code: number, message: any, transactionId: string, data :any,appInsightRaw?: any | null) {
        this.code = code;
        this.transactionId = transactionId;
        this.message = message
        this.data = data
    }
}