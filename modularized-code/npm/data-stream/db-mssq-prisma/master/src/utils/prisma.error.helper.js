"use strict";
// import { Prisma } from "@prisma/client"
// import { PrismaErrorModel } from "../dto/prisma.error.model"
// class PrismaErrorHelper {
//   public getPrismaErrorInstance(error: any) {
//     console.log("@@@@ -=--= getPrismaErrorInstance-=-=-=- >>> ", JSON.stringify(error))
//     const prismaErrorModel: PrismaErrorModel = new PrismaErrorModel()
//     if (error instanceof Prisma.PrismaClientInitializationError) {
//       // DB Connection issue: P1017
//       console.log("-=-=PrismaClientInitializationError=-=-=")
//       prismaErrorModel.errorInstance = "PrismaClientInitializationError";
//       prismaErrorModel.errorCode = error.errorCode;
//       prismaErrorModel.message = error.message;
//       prismaErrorModel.name = error.name;
//       prismaErrorModel.stack = error.stack;
//       prismaErrorModel.isErrorForResend = true;
//       return prismaErrorModel;
//     } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       // Error unique constraint violation
//       console.log("-=-=PrismaClientKnownRequestError=-=-=")
//     } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
//       // an error related to a request that does not have an error code.
//       console.log("-=-=PrismaClientUnknownRequestError=-=-=")
//     } else if (error instanceof Prisma.PrismaClientValidationError) {
//       console.log("-=-=PrismaClientValidationError=-=-=")
//     } else if (error instanceof Prisma.PrismaClientRustPanicError) {
//       // the underlying engine crashes and exits with a non-zero exit code.
//       console.log("-=-=PrismaClientRustPanicError=-=-=")
//     } else if (error.errorCode === "P1017" || error.errorCode === "P2024") {
//       // P1017 - Server has closed the connection.
//       // timed out fetching a new connection from the connection pool.
//       prismaErrorModel.errorInstance = null;
//       prismaErrorModel.errorCode = error.errorCode;
//       prismaErrorModel.message = error.message;
//       prismaErrorModel.name = error.name;
//       prismaErrorModel.stack = error.stack;
//       prismaErrorModel.isErrorForResend = true;
//       return prismaErrorModel;
//     } else {
//       return error;
//     }
//   }
// }
// export const prismaErrorHelper = new PrismaErrorHelper();
//# sourceMappingURL=prisma.error.helper.js.map