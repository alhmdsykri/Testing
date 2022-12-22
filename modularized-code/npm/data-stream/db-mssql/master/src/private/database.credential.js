"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseCredential = void 0;
class DatabaseCredential {
    static set(host, username, password, databaseName) {
        this.databaseName = databaseName;
        this.host = host;
        this.username = username;
        this.password = password;
    }
    static get() {
        return {
            databaseName: this.databaseName,
            host: this.host,
            username: this.username,
            password: this.password
        };
    }
}
exports.DatabaseCredential = DatabaseCredential;
//# sourceMappingURL=database.credential.js.map