namespace Sera.Application.Persistor
{
    public class UpdateRouteDeactivateHandler : BaseHandler,
                                         IRequestHandler<DeactivateRouteRequest, IResultStatus>
    {
        public UpdateRouteDeactivateHandler(IDbContext dbContext, IMessage message, IRESTUserClient userclient)
               : base(dbContext, message, userclient)
        { }

        public async Task<IResultStatus> Handle(DeactivateRouteRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region PAYLOAD SERVICE BUS

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.deactivateRoute.Serialize(),
                entity = "Route",
                feURL = string.Empty,
                method = HTTPMethod.PUT.ToString(),
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                source = "FleetX",
                username = request.userId,
                transactionId = request.transactionId
            };

            #endregion

            #region UPDATE MSSQL (IN-INACTIVE)
            var apiDRBACResponse = await userclient.GetDRBACAsync(request.transactionId, request.userId);

            var entity = dbContext.Route
                                    .Where(x => apiDRBACResponse.Data.businessUnits.Contains(x.businessUnitId) &&
                                                x.routeCode == request.deactivateRoute.routeId &&
                                                x.completionStatus == (int)CompletionStatus.INPROGRESS &&
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

            entity.completionStatus = (int)CompletionStatus.INACTIVE;
            entity.modifiedBy = request.userId;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.COMPLETED;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS = INPROGRESS

            sbusRequest.status = (int)EventStatus.INPROGRESS;

            List<string> jsonRequestStatusInprogress = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestStatusInprogress);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS = COMPLETED

            sbusRequest.status = (int)EventStatus.COMPLETED;

            List<string> jsonRequestStatusCompleted = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestStatusCompleted);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestStatusCompleted);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}