namespace Sera.Application.Persistor.DLQ
{
    public class RouteLocationDLQUpdateHandler : BaseHandler,
                                                 IRequestHandler<RouteLocationDLQUpdateRequest, IResultStatus>
    {
        public RouteLocationDLQUpdateHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(RouteLocationDLQUpdateRequest request,
                                                CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();

            #region UPDATE DATA ROUTE WITH OLD DATA

            SQL.Route entity = await dbContext.Route.FindAsync(request.data.routeId);

            if (entity == null || entity.routeId <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId} Message : ", Message.NotExist("Route"));
            }

            entity.routeCode = request.data.routeCode;
            entity.routeName = request.data.routeName;
            entity.departurePoolId = request.data.departurePoolId;
            entity.departurePoolCode = request.data.departurePoolCode;
            entity.departurePoolName = request.data.departurePoolName;
            entity.returnRouteId = request.data.returnRouteId;
            entity.returnRouteCode = request.data.returnRouteCode;
            entity.returnRouteName = request.data.returnRouteName;
            entity.lastUpdate = request.data.lastUpdate;
            entity.routeKML = request.data.routeKML;
            entity.routeJSON = request.data.routeJSON;
            entity.customerId = request.data.customerId;
            entity.customerCode = request.data.customerCode;
            entity.customerName = request.data.customerName;
            entity.contractNumber = request.data.contractNumber;
            entity.status = (int)EventStatus.COMPLETED;
            entity.completionStatus = request.data.completionStatus;
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.version = AppConst.DATA_VERSION;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #endregion

            #region SEND NOTIFICATION TO FIREBASE STATUS 3

            ServiceBusRequest<string> sbsRequest = new()
            {
                action = request.action,
                data = request.Serialize(),
                entity = "Route Location",
                feURL = string.Empty,
                filter = string.Empty,
                method = HTTPMethod.POST.ToString(),
                source = "FleetX",
                startDate = request.startDate,
                endDate = request.endDate,
                status = (int)EventStatus.FAIL,
                transactionId = request.transactionId,
                username = request.username
            };

            List<string> jsonRequest = new() { sbsRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            return result.ReturnSuccessStatus();
        }
    }
}
