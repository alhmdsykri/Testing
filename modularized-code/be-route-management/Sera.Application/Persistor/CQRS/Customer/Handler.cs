namespace Sera.Application.Persistor.CQRS
{
    public class CQRSUpdateCustomerHandler : BaseHandler,
                                             IRequestHandler<CQRSUpdateCustomerRequest, IResultStatus>
    {
        public CQRSUpdateCustomerHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CQRSUpdateCustomerRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE EVENT SOURCE STATUS 1
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Route",
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

            #region UPDATE ROUTE
            TransactionOptions options = new()
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            };
            using (TransactionScope scope = new(TransactionScopeOption.Required, options,
                                                TransactionScopeAsyncFlowOption.Enabled))
            {
                var customerId = request.data.Select(x => x.customerId).Distinct().ToList();

                if (customerId.IsEmpty())
                {
                    return result.ReturnErrorStatus(Message.Empty("Customer id"));
                }

                var routeLocation = await dbContext.Route
                                                   .Where(x => customerId.Contains(x.customerId.Value) &&
                                                               x.status == (int)EventStatus.COMPLETED)
                                                   .ToListAsync(cancellationToken);

                if (routeLocation.IsEmpty())
                {
                    return result.ReturnErrorStatus(Message.NotFound("Route by customer"));
                }

                routeLocation.ForEach(x =>
                {
                    x.customerCode = request.data.FirstOrDefault(y => y.customerId == x.customerId)?.customerCode;
                    x.customerName = request.data.FirstOrDefault(y => y.customerId == x.customerId)?.customerName;
                    //x.modifiedBy = request.username; [REVISIT] DBX doesn't have user id
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = request.data.FirstOrDefault(y => y.customerId == x.customerId).status;
                });

                await dbContext.SaveChangesAsync(cancellationToken);

                scope.Complete();
            }
            #endregion

            #region SEND MESSAGE SERVICE BUS TO CREATE ROUTE LOCATION EVENT SOURCE STATUS 2
            sbusRequest.status = (int)EventStatus.COMPLETED;
            sbusRequest.entity = "Route";

            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}