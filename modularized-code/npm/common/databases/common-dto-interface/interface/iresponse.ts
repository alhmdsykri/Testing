export interface IResponseSuccessJson {
  transactionId: string,
  message: "Success, API successfully executed";
}

export interface IResponseBadRequestErrorJson {
  transactionId: string,
  message: "Bad Request, invalid user input";
}

export interface IResponseAuthorizationErrorJson {
  transactionId: string,
  message: "Access is forbidden";
}

export interface IResponseNotFoundErrorJson {
  transactionId: string,
  message: "Not Found";
}

export interface IResponseServerErrorJson {
  transactionId: string,
  message: "Server error, please contact IT support";
}