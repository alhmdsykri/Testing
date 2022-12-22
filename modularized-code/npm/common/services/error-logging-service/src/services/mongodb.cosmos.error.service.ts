import { ERROR_ENUM, CONSTANT } from "../constants/DB_ERROR_CONSTANT.json";
import { ErrorModel } from "../model/error.model";
import { MongoDBErrorType } from "../type/mongodb.error.type";
import * as _ from "lodash";

export class MongoCosmosErrorService {

  public isValidationError (error: ErrorModel) {
    let isFound: boolean = false;
    const connCategories: any[] = CONSTANT.MONMGODB_ISSUES.VALIDATION;
    const errorCodes: any = ERROR_ENUM.MONGODB_COSMOS.error_codes;
    const mongoDBError: MongoDBErrorType = error?.appInsightRaw;
    const errorCode: any = mongoDBError.code;
    const errorObject: any = _.find(errorCodes, ['code', errorCode]);
    if (errorObject) {
      console.log("######## isValidationError -->> ", errorObject)
      const categories: any[] = errorObject.categories;
      connCategories.forEach((connCat: any) => {
        categories.forEach((cat: any) => {
          if (connCat === cat) {
            console.log(`Matched ${connCat} = ${cat}`)
            isFound = true;
          }
        });
      });
    }
    return isFound;
  }

  public isConnectionError (error: ErrorModel) {
    let isFound: boolean = false;
    const connCategories: any[] = CONSTANT.MONMGODB_ISSUES.CONNECTION.CATEGORIES;
    const errorCodes: any = ERROR_ENUM.MONGODB_COSMOS.error_codes;
    const mongoDBError: MongoDBErrorType = error?.appInsightRaw;
    const errorCode: any = mongoDBError.code;
    const errorObject: any = _.find(errorCodes, ['code', errorCode]);
    if (errorObject) {
      console.log("######## Connection Issue Found -->> ", errorObject)
      const categories: any[] = errorObject.categories;
      connCategories.forEach((connCat: any) => {
        categories.forEach((cat: any) => {
          if (connCat === cat) {
            console.log(`Matched ${connCat} = ${cat}`)
            isFound = true;
          }
        });
      });
    }
    return isFound;
  }

  public isAccessError (error: ErrorModel) {
    const errorCodes: any = ERROR_ENUM.MONGODB_COSMOS.error_codes;
    const mongoDBError: MongoDBErrorType = error?.appInsightRaw;
    const errorCode: any = mongoDBError.code;
    const errorObject: any = _.find(errorCodes, ['code', errorCode]);
    if (errorObject) {
      console.log("######## Access Issue Found -->> ", errorObject)
      if (CONSTANT.MONMGODB_ISSUES.ACCESS.includes(errorObject.name)) {
        return true
      }
    }
    return false;
  }

  public isDBError(error: ErrorModel) {
    const mongoDBError: MongoDBErrorType = error?.appInsightRaw;
    console.log("@@@@ isDBError -->> ", mongoDBError)
    if(mongoDBError && mongoDBError.code !== null && mongoDBError.index !== null) {
      return true;
    }
    return false; 
  }
}

export const mongoCosmosErrorService = new MongoCosmosErrorService();

