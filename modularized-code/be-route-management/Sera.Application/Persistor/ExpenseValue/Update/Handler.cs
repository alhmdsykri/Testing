using Sera.Entity.SQL;

namespace Sera.Application.Persistor
{
    public class UpdatetripExpenseValueHandler : BaseHandler,
                                                 IRequestHandler<UpdateExpenseValueRequest, IResultStatus>
    {
        public UpdatetripExpenseValueHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateExpenseValueRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE EXPENSE VALUE

            if (request.data.updateExpenseValueExpenseDetail.Count > 0)

            {
                var entityExpenseValue = await dbContext.ExpenseValue
                                        .Where(x => x.tripExpenseid == request.data.tripExpenseId &&
                                                    x.status == (int)EventStatus.COMPLETED)
                                        .ToListAsync();


                if (entityExpenseValue.Count > 0)
                {

                    TransactionOptions options = new TransactionOptions();
                    options.IsolationLevel = IsolationLevel.ReadCommitted;
                    using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                         TransactionScopeAsyncFlowOption.Enabled))
                    {

                        request.data.updateExpenseValueExpenseDetail.ForEach(y =>
                        {
                            entityExpenseValue.ForEach(x =>
                            {
                                if (x.expenseId == y.expenseCategoryId)
                                {
                                    x.value = y.value;
                                    x.status = (int)EventStatus.COMPLETED;
                                    x.modifiedAt = DateTime.Now;
                                    x.modifiedBy = request.username;
                                    x.transactionId = request.transactionId;
                                }

                            });
                        });

                        if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                        {
                            return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                        }

                        scope.Complete();
                    }

                }
            }

           
            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE EXPENSE VALUE STATUS 2

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.EXPENSE_VALUE,
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

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE REVENUE STATUS 1

            ServiceBusRequest<string> sbusRequestRevenue = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.REVENUE,
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

            List<string> jsonRequesRevenuetEvent = new() { sbusRequestRevenue.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequesRevenuetEvent);
            #endregion

            #region SEND MESSAGE TO SERVICE REVENUE PERSISTOR

            List<UpdateRevenueDetailModel> UpdateRevenueDetail = new();

            UpdateRevenueModel UpdateRevenue = new()
            {
                routeId = request.data.routeId,
                tripExpenseId = request.data.tripExpenseId,
                totalExpense = request.data.totalExpense,
                revenue = request.data.revenue,
                COGS = request.data.COGS,
                distance = request.data.distance
            };

            UpdateRevenueDetail = request.data.updateExpenseValueExpenseDetail.Select(x => new UpdateRevenueDetailModel
            {
                expenseCategoryId = x.expenseCategoryId,
                value = x.value
            }).ToList();

            UpdateRevenue.UpdateRevenueDetail = UpdateRevenueDetail;

            ServiceBusRequest<UpdateRevenueModel> sbusMSSQLRequest = new()
            {
                data = UpdateRevenue,
                entity = AppConst.REVENUE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_REVENUE,
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
