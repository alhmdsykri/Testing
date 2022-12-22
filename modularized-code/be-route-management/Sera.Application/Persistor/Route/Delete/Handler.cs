namespace Sera.Application.Persistor
{
    public class DeleteRouteHandler : BaseHandler,
                                         IRequestHandler<DeleteRouteRequest, IResultStatus>
    {
        public DeleteRouteHandler(IDbContext dbContext, IMessage message, IRESTUserClient userclient)
               : base(dbContext, message, userclient)
        { }

        public async Task<IResultStatus> Handle(DeleteRouteRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();
            if (request.deleteRoute.status == 1)
            {
                ServiceBusRequest<string> sbusRequest = new()
                {
                    data = request.deleteRoute.Serialize(),
                    entity = "Route",
                    feURL = string.Empty,
                    method = HTTPMethod.DELETE.ToString(),
                    filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                    source = "FleetX",
                    status = (int)EventStatus.INPROGRESS,
                    username = request.userId,
                    transactionId = request.transactionId
                };               

                #region UPDATE MSSQL (IN-PROGRESS)

                var apiDRBACResponse = await userclient.GetDRBACAsync(request.transactionId, request.userId);

                var entity = dbContext.Route
                                      .Where(x => x.routeCode == request.deleteRoute.routeId &&
                                                  apiDRBACResponse.Data.businessUnits.Contains(x.businessUnitId) &&
                                                  x.completionStatus == (int)CompletionStatus.INCOMPLETED &&
                                                  x.status == (int)EventStatus.COMPLETED)
                                      .FirstOrDefault();

                if (entity == null)
                {
                    sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                    sbusRequest.status = (int)EventStatus.REJECTED;
                    sbusRequest.message = Message.NotFound("UnAuthorized User Or Incomplete Clasification Route");

                    List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                    await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                                   CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                                   jsonRequestRejected);

                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }

                entity.modifiedBy = request.userId;
                entity.modifiedAt = DateTime.UtcNow;
                entity.status = (int)EventStatus.INPROGRESS;
                entity.transactionId = request.transactionId;

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }
                #endregion

                DeleteRouteModel deletedRouteModel = new();
                deletedRouteModel.routeId = entity.routeId;
                deletedRouteModel.routeCode = entity.routeCode;
                deletedRouteModel.routeName = entity.routeName;
                deletedRouteModel.status = request.deleteRoute.status;
                sbusRequest.data = deletedRouteModel.Serialize();

                #region SEND MESSAGE TO SERVICE BUS EVENT HISTORY (IN-PROGRESS)
                List<string> jsonRequest = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                               jsonRequest);
                #endregion

                #region SEND MESSAGE TO SERVICE BUS FIREBASE (IN-PROGRESS)
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                jsonRequest = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequest);
                #endregion               

                #region SEND MESSAGE TO SERVICE BUS ROUTE LOCATION
                ServiceBusRequest<DeleteRouteModel> sbusRouteLocationRequest = new()
                {
                    data = deletedRouteModel,
                    entity = "Route Location",
                    feURL = string.Empty,
                    method = HTTPMethod.DELETE.ToString(),
                    source = sbusRequest.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = sbusRequest.username,
                    transactionId = sbusRequest.transactionId,
                    filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                    action = AppConst.FA_ACTION_DELETE_ROUTE_LOCATION_FMS,
                    startDate = DateTime.UtcNow,
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE)
                };

                List<string> jsonRouteLocationRequest = new() { sbusRouteLocationRequest.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                               jsonRouteLocationRequest);
                #endregion
            }

            if (request.deleteRoute.status == 0)
            {
                #region UPDATE MSSQL (DELETED)
                var entity = dbContext.Route
                                      .Where(x => x.routeId == request.deleteRoute.routeId &&
                                                  x.completionStatus == (int)CompletionStatus.INCOMPLETED)
                                      .FirstOrDefault();

                if (entity == null)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }

                entity.modifiedBy = request.userId;
                entity.modifiedAt = DateTime.UtcNow;
                entity.status = (int)EventStatus.DELETED;
                entity.transactionId = request.transactionId;

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }
                #endregion               

                #region SEND MESSAGE TO SERVICE BUS EVENT HISTORY (DELETED)
                ServiceBusRequest<string> sbusRequestDone = new()
                {
                    data = request.deleteRoute.Serialize(),
                    entity = "Route",
                    feURL = string.Empty,
                    method = HTTPMethod.DELETE.ToString(),
                    filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                    source = "FleetX",
                    status = (int)EventStatus.DELETED,
                    username = request.userId,
                    transactionId = request.transactionId
                };

                List<string> jsonRequestDone = new() { sbusRequestDone.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                               jsonRequestDone);
                #endregion

                #region SEND MESSAGE TO SERVICE BUS FIREBASE (COMPLETED)
                sbusRequestDone.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequestDone.status = (int)EventStatus.COMPLETED;

                jsonRequestDone = new() { sbusRequestDone.Serialize() };
                await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestDone);
                #endregion
            }

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}