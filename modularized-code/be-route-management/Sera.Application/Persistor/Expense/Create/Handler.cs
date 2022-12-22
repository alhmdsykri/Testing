namespace Sera.Application.Persistor
{
    public class CreatetripExpenseHandler : BaseHandler, IRequestHandler<CreateTripExpenseRequest, IResultStatus>
    {
        public CreatetripExpenseHandler(IDbContext dbContext, IMessage message) : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateTripExpenseRequest request, CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region INSERT TO TRIPEXPENSE

            List<SQL.TripExpense> listData = new();

            TransactionOptions options = new TransactionOptions();
            options.IsolationLevel = IsolationLevel.ReadCommitted;
            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                 TransactionScopeAsyncFlowOption.Enabled))
            {
                foreach (var item in request.data)
                {
                    SQL.TripExpense entity = new();

                    entity.transactionId = request.transactionId;
                    entity.routeId = item.routeId;
                    entity.productVehicleTypeId = item.productVehicleTypeId;
                    entity.businessUnitId = item.businessUnitId;
                    entity.totalExpense = item.totalExpense;
                    entity.status = (int)EventStatus.INPROGRESS;
                    entity.createdBy = request.username;
                    entity.createdAt = DateTime.UtcNow;
                    entity.modifiedBy = request.username;
                    entity.modifiedAt = DateTime.UtcNow;

                    listData.Add(entity);
                }

                scope.Complete();
            }

            await dbContext.TripExpense.AddRangeAsync(listData, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.ForEach(x =>
            {
                listData.ForEach(y =>
                {
                    if (x.productVehicleTypeId == y.productVehicleTypeId)
                    {
                        x.tripExpenseId = y.tripExpenseId;
                    }
                });
            });

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE EXPENSE VALUE STATUS 1

            List<CreateExpenseValueModel> ExpenseValue = new();
            List<ExpenseValueExpenseDetailModel> listExpenseDetail = new();

            ExpenseValue = request.data.Select(x => new CreateExpenseValueModel
            {
                productVehicleTypeId = x.productVehicleTypeId,
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

            foreach (var item in ExpenseValue)
            {
                var te = request.data.Where(x => x.tripExpenseId == item.tripExpenseId).FirstOrDefault();
                item.ExpenseValueExpenseDetail = te.expenseDetail.Select(x => new ExpenseValueExpenseDetailModel
                {
                    expenseCategoryId = x.expenseCategoryId,
                    value = x.value
                }).ToList();
            }

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.EXPENSE_VALUE,
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

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS EXPENSE VALUE PERSISTOR

            ServiceBusRequest<List<CreateExpenseValueModel>> sbusMSSQLRequest = new()
            {
                data = ExpenseValue,
                entity = AppConst.EXPENSE_VALUE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_POST_ROUTE_EXPENSE_VALUE,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            jsonRequest = new() { sbusMSSQLRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
