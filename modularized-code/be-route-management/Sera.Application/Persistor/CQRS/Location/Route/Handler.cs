namespace Sera.Application.Persistor.CQRS
{
    public class CQRSUpdateRouteHandler : BaseHandler,
                                              IRequestHandler<CQRSUpdateRouteRequest, IResultStatus>
    {
        public CQRSUpdateRouteHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CQRSUpdateRouteRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region SEND MESSAGE SERVICE BUS  TO CREATE ROUTE & ROUTE LOCATION EVENT SOURCE STATUS 1
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = request.status,
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

            #region INSERT OR UPDATE ROUTE LOCATION
            TransactionOptions options = new()
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            };
            using (TransactionScope scope = new(TransactionScopeOption.Required, options,
                                                TransactionScopeAsyncFlowOption.Enabled))
            {
                var entityRouteDeparture = await dbContext.Route
                                                 .Where(x => x.departurePoolId == request.data.locationId &&
                                                             x.status == (int)EventStatus.COMPLETED)
                                                 .ToListAsync(cancellationToken);

                entityRouteDeparture.ForEach(x =>
                {
                    x.departurePoolId = x.departurePoolId;
                    x.departurePoolName = request.data.locationName;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                    x.transactionId = request.transactionId;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                var entityRouteArrival = await dbContext.Route
                                                 .Where(x => x.arrivalPoolId == request.data.locationId &&
                                                             x.status == (int)EventStatus.COMPLETED)
                                                 .ToListAsync(cancellationToken);

                entityRouteArrival.ForEach(x =>
                {
                    x.arrivalPoolId = x.arrivalPoolId;
                    x.arrivalPoolName = request.data.locationName;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                    x.transactionId = request.transactionId;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                scope.Complete();
            }
            #endregion

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE & ROUTE LOCATION EVENT SOURCE STATUS 2

            sbusRequest.status = (int)EventStatus.COMPLETED;
            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}