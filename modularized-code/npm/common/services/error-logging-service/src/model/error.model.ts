export class ErrorModel {
    public code?: number | null;
    public transactionId?: string | null;
    public message?: any | null;
    public appInsightRaw?: any | null;

    constructor(code: number, message: any, transactionId: string, appInsightRaw?: any | null) {
        this.code = code;
        this.transactionId = transactionId;
        this.message = message,
        this.appInsightRaw = appInsightRaw
    }
}