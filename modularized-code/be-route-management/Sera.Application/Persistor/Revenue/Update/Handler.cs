namespace Sera.Application.Persistor
{
    public class UpdateRevenueHandler : BaseHandler,
                                        IRequestHandler<UpdateRevenueRequest, IResultStatus>
    {
        public UpdateRevenueHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateRevenueRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE REVENUE

            var entityRevenue = await dbContext.Revenue
                                               .Where(x => x.tripExpenseId == request.data.tripExpenseId &&
                                                           x.status == (int)EventStatus.COMPLETED)
                                               .ToListAsync();

            if (entityRevenue.Count > 0)
            {
                entityRevenue.ForEach(x =>
                {
                    x.revenue = request.data.revenue;
                    x.COGS = request.data.COGS;
                    x.distance = request.data.distance;
                    x.status = (int)EventStatus.COMPLETED;
                    x.modifiedAt = DateTime.Now;
                    x.modifiedBy = request.username;
                    x.transactionId= request.transactionId;
                });

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE REVENUE STATUS 2

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.REVENUE,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate,
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                action = request.action
            };

            List<string> jsonRequestEvent = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestEvent);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE ROUTE STATUS 1
            ServiceBusRequest<string> sbusRequestRoute = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.ROUTE,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate,
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                action = request.action
            };

            List<string> jsonRequesRouteEvent = new() { sbusRequestRoute.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequesRouteEvent);
            #endregion

            #region SEND MESSAGE TO SERVICE ROUTE PERSISTOR

            List<UpdateCompletionStatusDetailFromUpdateTripExpenseModel> UpdateCompletionStatusDetailFromUpdateTripExpenseDetail = new();

            UpdateCompletionStatusFromUpdateTripExpenseModel UpdateCompletionStatusFromUpdateTripexpense = new()
            {
                routeId = request.data.routeId,
                tripExpenseId = request.data.tripExpenseId,
                totalExpense = request.data.totalExpense,
                revenue = request.data.revenue,
                COGS = request.data.COGS,
                distance = request.data.distance
            };

            UpdateCompletionStatusDetailFromUpdateTripExpenseDetail = request.data.UpdateRevenueDetail.Select(x => new UpdateCompletionStatusDetailFromUpdateTripExpenseModel
            {
                expenseCategoryId = x.expenseCategoryId,
                value = x.value
            }).ToList();

            UpdateCompletionStatusFromUpdateTripexpense.UpdateCompletionStatusDetailFromUpdateTripExpense = UpdateCompletionStatusDetailFromUpdateTripExpenseDetail;

            ServiceBusRequest<UpdateCompletionStatusFromUpdateTripExpenseModel> sbusMSSQLRequest = new()
            {
                data = UpdateCompletionStatusFromUpdateTripexpense,
                entity = AppConst.ROUTE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_COMPLETION_STATUS_UPDATE_TRIP_EXPENSE,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusMSSQLRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion
            
            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
