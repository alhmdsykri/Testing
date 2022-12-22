"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const database_credential_1 = require("./database.credential");
exports.sequelize = new sequelize_1.Sequelize("", "", "", {
    host: "",
    dialect: "mssql",
    hooks: {
        // tslint:disable-next-line: no-shadowed-variable
        beforeConnect: (msconfig) => __awaiter(void 0, void 0, void 0, function* () {
            const databaseCredential = database_credential_1.DatabaseCredential.get();
            msconfig.database = databaseCredential.databaseName;
            msconfig.host = databaseCredential.host;
            msconfig.username = databaseCredential.username;
            msconfig.password = databaseCredential.password;
        })
    },
    logging: false,
    pool: {
        max: 30,
        min: 0,
        acquire: 60000,
        idle: 5000
    }
});
//# sourceMappingURL=database.js.map