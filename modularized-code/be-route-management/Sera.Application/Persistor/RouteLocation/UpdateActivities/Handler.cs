using Mapster;

namespace Sera.Application.Persistor
{
    public class UpdateActivitiesHandler : BaseHandler,
                                         IRequestHandler<UpdateActivitiesRequest, IResultStatus>
    {
        public UpdateActivitiesHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateActivitiesRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region BUILD MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                action = AppConst.FA_ACTION_PUT_ACTIVITY_ROUTE_LOCATION,
                filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };
            #endregion

            // Firebase: RouteLocation
            List<string> jsonRequestRouteLocation = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME, jsonRequestRouteLocation);

            var entity = await dbContext.RouteLocation.FindAsync(request.data.routeLocationId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region Update RouteLocation
            entity.routeLocationId = request.data.routeLocationId;
            entity.routeActionId = request.data.routeActionId;
            entity.distanceToNextLocation = request.data.distanceToNextLocation;
            entity.status = (int) EventStatus.INPROGRESS;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            var updateCompletionStatusFromRouteLocationModel = request.data.Adapt<UpdateCompletionStatusFromRouteLocationModel>();
            updateCompletionStatusFromRouteLocationModel.routeId = entity.routeId;

            #region Send Message for Route Service Bus

            sbusRequest.data = updateCompletionStatusFromRouteLocationModel.Serialize();
            sbusRequest.entity = AppConst.ROUTE;
            sbusRequest.action = AppConst.FA_ACTION_PUT_ROUTE_COMPLETION_STATUS_FROM_ROUTE_LOCATION;
            List<string> jsonRequestRoute = new() { sbusRequest.Serialize() };

            // Event: Route
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME, jsonRequestRoute);

            ServiceBusRequest<UpdateCompletionStatusFromRouteLocationModel> sbusRequestRouteMssql = new()
            {
                data = updateCompletionStatusFromRouteLocationModel,
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_COMPLETION_STATUS_FROM_ROUTE_LOCATION,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            // MSSQL: Route
            List<string> sbusRequestRouteMssqlJson = new() { sbusRequestRouteMssql.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME, CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME, sbusRequestRouteMssqlJson);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}