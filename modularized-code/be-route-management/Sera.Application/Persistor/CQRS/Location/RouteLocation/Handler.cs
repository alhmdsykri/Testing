namespace Sera.Application.Persistor.CQRS
{
    public class CQRSUpdateRouteLocationHandler : BaseHandler,
                                              IRequestHandler<CQRSUpdateRouteLocationRequest, IResultStatus>
    {
        public CQRSUpdateRouteLocationHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CQRSUpdateRouteLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region SEND MESSAGE SERVICE BUS  TO CREATE ROUTE & ROUTE LOCATION EVENT SOURCE STATUS 1
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Route Location",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                startDate = DateTime.UtcNow,
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE)
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };

            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region UPDATE ROUTE LOCATION MSSQL
            TransactionOptions options = new()
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            };
            using (TransactionScope scope = new(TransactionScopeOption.Required, options,
                                                TransactionScopeAsyncFlowOption.Enabled))
            {

                var entityRouteLocation = await dbContext.RouteLocation
                                                         .Where(x => x.locationId == request.data.locationId &&
                                                                     x.status == (int)EventStatus.COMPLETED)
                                                         .ToListAsync(cancellationToken);

                entityRouteLocation.ForEach(x =>
                {
                    x.routeLocationId = x.routeLocationId;
                    x.locationId = request.data.locationId;
                    x.locationName = request.data.locationName;
                    x.locationTypeId = request.data.locationTypeId;
                    x.latitude = request.data.latitude;
                    x.longitude = request.data.longitude;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                    x.transactionId = request.transactionId;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                scope.Complete();
            }
            #endregion

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE LOCATION EVENT SOURCE STATUS 2

            sbusRequest.status = (int)EventStatus.COMPLETED;

            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE SERVICE BUS TO SEND ROUTE CQRS

            CQRSUpdateRoute cqrsUpdateRoute = new();
            cqrsUpdateRoute.locationId = request.data.locationId;
            cqrsUpdateRoute.locationName = request.data.locationName;

            ServiceBusRequest<CQRSUpdateRoute> sbusRouteRequest = new()
            {
                data = cqrsUpdateRoute,
                entity = "Route",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_CQRS_ROUTE_FILTER_NAME,
                action = AppConst.FA_ACTION_CQRS_PUT_ROUTE,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRouteRequest = new() { sbusRouteRequest.Serialize() };

            await message.SendMessageAsync(AppConst.ROUTES_CQRS_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_CQRS_ROUTE_FILTER_NAME,
                                           jsonRouteRequest);
            #endregion           

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}