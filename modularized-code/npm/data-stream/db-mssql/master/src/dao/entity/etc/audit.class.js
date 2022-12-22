"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditClass = void 0;
class AuditClass {
    constructor() {
        this.createdBy = 0;
        this.createdAt = "";
        this.modifiedBy = 0;
        this.modifiedAt = "";
        this.transactionId = "";
        this.dataStoreTime = "";
        this.sapMssqlSinkTime = "";
    }
    setParentSource(data) {
        this.createdBy = data.createdBy;
        this.createdAt = data.createdAt;
        this.modifiedBy = data.modifiedBy;
        this.modifiedAt = data.modifiedAt;
        this.transactionId = data.transactionId;
        this.dataStoreTime = data.dataStoreTime;
        this.sapMssqlSinkTime = data.sapMssqlSinkTime;
    }
    addAuditAttribute(data) {
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
exports.AuditClass = AuditClass;
//# sourceMappingURL=audit.class.js.map