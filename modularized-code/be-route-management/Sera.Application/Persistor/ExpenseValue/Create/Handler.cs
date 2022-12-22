namespace Sera.Application.Persistor
{
    public class CreatetripExpenseValueHandler : BaseHandler,
                                                 IRequestHandler<CreateTripExpenseValueRequest, IResultStatus>
    {
        public CreatetripExpenseValueHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateTripExpenseValueRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region INSERT TO EXPENSE VALUE

            List<SQL.ExpenseValue> listData = new();

            TransactionOptions options = new TransactionOptions();
            options.IsolationLevel = IsolationLevel.ReadCommitted;
            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                 TransactionScopeAsyncFlowOption.Enabled))
            {

                foreach (var item in request.data)
                {
                    foreach(var expenseValue in item.ExpenseValueExpenseDetail)
                    {
                        SQL.ExpenseValue entity = new();

                        entity.tripExpenseid = item.tripExpenseId;
                        entity.expenseId = expenseValue.expenseCategoryId;
                        entity.value = expenseValue.value;
                        entity.productVehicleTypeId = item.productVehicleTypeId;
                        entity.referenceNumber = item.routeId.ToString();
                        entity.expenseCalculatedType = AppConst.FIXED;
                        entity.function = String.Empty;
                        entity.status = (int)EventStatus.COMPLETED;
                        entity.createdBy = request.username;
                        entity.createdAt = DateTime.UtcNow;
                        entity.modifiedBy = request.username;
                        entity.modifiedAt = DateTime.UtcNow;
                        entity.transactionId = request.transactionId;

                        listData.Add(entity);
                    }
                }

                scope.Complete();
            }

            await dbContext.ExpenseValue.AddRangeAsync(listData, cancellationToken);
            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
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

            #region SEND MESSAGE TO SERVICE BUS REVENUE PERSISTOR

            List<CreateRevenueModel> Revenue = new();
            List<RevenueExpenseDetailModel> listExpenseDetail = new();

            Revenue = request.data.Select(x => new CreateRevenueModel
            {
                productVehicleTypeId= x.productVehicleTypeId,
                routeId = x.routeId,
                tripExpenseId = x.tripExpenseId,
                businessUnitId = x.businessUnitId,
                productId = x.productId,
                vehicleTypeId = x.vehicleTypeId,
                vehicleTypeCode = x.vehicleTypeCode,
                vehicleTypeName = x.vehicleTypeName,
                totalExpense = x.totalExpense,
                revenue = x.revenue,
                COGS = x.COGS,
                uomCode = x.uomCode,
                distance = x.distance,
            }).ToList();

            foreach (var item in Revenue)
            {
                var te = request.data.Where(x => x.tripExpenseId == item.tripExpenseId).FirstOrDefault();
                item.RevenueExpenseDetail = te.ExpenseValueExpenseDetail.Select(x => new RevenueExpenseDetailModel
                {
                    expenseCategoryId = x.expenseCategoryId,
                    value = x.value
                }).ToList();
            }

            ServiceBusRequest<List<CreateRevenueModel>> sbusMSSQLRequest = new()
            {
                data = Revenue,
                entity = AppConst.REVENUE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_POST_ROUTE_REVENUE,
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
