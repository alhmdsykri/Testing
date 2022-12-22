namespace Sera.Application.Persistor.CQRS
{
    public class CQRSUpdateBranchHandler : BaseHandler,
                                           IRequestHandler<CQRSUpdateBranchRequest, IResultStatus>
    {
        public CQRSUpdateBranchHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CQRSUpdateBranchRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE & ROUTE LOCATION EVENT SOURCE STATUS 1
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
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };

            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region UPDATE ROUTE LOCATION
            TransactionOptions options = new()
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            };
            using (TransactionScope scope = new(TransactionScopeOption.Required, options,
                                                TransactionScopeAsyncFlowOption.Enabled))
            {
                List<SQL.RouteLocation> routeLocation =
                    await dbContext.RouteLocation
                                   .Where(x => x.branchId == request.data.branchId &&
                                               x.status == (int)EventStatus.COMPLETED)
                                   .ToListAsync(cancellationToken: cancellationToken);

                routeLocation.ForEach(x =>
                {
                    x.branchCode = request.data.branchCode;
                    x.branchName = request.data.branchName;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                scope.Complete();
            }

            #endregion

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE LOCATION EVENT SOURCE STATUS 2

            sbusRequest.status = (int)EventStatus.COMPLETED;
            sbusRequest.entity = "Route Location";

            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}