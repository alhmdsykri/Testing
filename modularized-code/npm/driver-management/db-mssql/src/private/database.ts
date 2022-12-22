import { Sequelize, QueryTypes } from "sequelize";
import { DatabaseCredential } from "./database.credential";

export const sequelize: Sequelize = new Sequelize("", "", "",
  {
    host: "",
    dialect: "mssql",
    hooks: {
      // tslint:disable-next-line: no-shadowed-variable
      beforeConnect: async (msconfig) => {
        const databaseCredential: any = DatabaseCredential.get();
        msconfig.database = databaseCredential.databaseName;
        msconfig.host = databaseCredential.host;
        msconfig.username = databaseCredential.username;
        msconfig.password = databaseCredential.password;
      }
    },
    logging: false,
  }
);

