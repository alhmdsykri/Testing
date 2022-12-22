import { ERROR_ENUM } from "../constants/DB_ERROR_CONSTANT.json";
import { ErrorModel } from "../model/error.model";

export class SequelizeErrorService {

    public isValidationError (error: ErrorModel) {
      const errorName: any = error.appInsightRaw?.name;
      if (errorName) {
        if (ERROR_ENUM.SEQUELIZE.VALIDATION.includes(errorName)) {
          return true
        }
      }
      return false;
    }

    public isConnectionError (error: ErrorModel) {
      const errorName: any = error.appInsightRaw?.name;
      if (errorName) {
        if (ERROR_ENUM.SEQUELIZE.CONNECTION.includes(errorName)) {
          return true
        }
      }
      return false;
    }

    public isAccessError (error: ErrorModel) {
      const errorName: any = error.appInsightRaw?.name;
      if (errorName) {
        if (ERROR_ENUM.SEQUELIZE.ACCESS.includes(errorName)) {
          return true
        }
      }
      return false; 
    }

    public isDBError (error: ErrorModel) {
      const errorName: any = error.appInsightRaw?.name;
      console.log("@@ Error Name ->> ", errorName)
      if (errorName) {
        if (this.isConnectionError(error) 
          || this.isAccessError(error)
          || this.isValidationError(error)
        ) {
          return true
        }
      }
      return false; 
    }
}


export const sequelizeErrorService = new SequelizeErrorService();

