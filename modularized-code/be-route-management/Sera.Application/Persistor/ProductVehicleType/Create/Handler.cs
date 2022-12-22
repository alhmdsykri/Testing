namespace Sera.Application.Persistor
{
    public class CreateProductVehicleTypeHandler : BaseHandler,
                                                 IRequestHandler<CreateProductVehicleTypeRequest, IResultStatus>
    {
        public CreateProductVehicleTypeHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateProductVehicleTypeRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region INSERT TO PRODUCT VEHICLE TYPE

            List<SQL.ProductVehicleType> listData = new();

            TransactionOptions options = new TransactionOptions();
            options.IsolationLevel = IsolationLevel.ReadCommitted;
            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                 TransactionScopeAsyncFlowOption.Enabled))
            {

                foreach (var item in request.data.tripExpense)
                {
                    SQL.ProductVehicleType entity = new();

                    entity.productId = item.productId;
                    entity.vehicleTypeId = item.vehicleTypeId;
                    entity.vehicleTypeCode = item.vehicleTypeCode;
                    entity.vehicleTypeName = item.vehicleTypeName;
                    entity.uomCode = item.uomCode;
                    entity.driverType = AppConst.INTERNAL;
                    entity.status = (int)EventStatus.INPROGRESS;
                    entity.createdBy = request.username;
                    entity.createdAt = DateTime.UtcNow;
                    entity.modifiedBy = request.username;
                    entity.modifiedAt = DateTime.UtcNow;
                    entity.version = AppConst.DATA_VERSION;
                    entity.transactionId = request.transactionId;

                    listData.Add(entity);
                }

                await dbContext.ProductVehicleType.AddRangeAsync(listData, cancellationToken);

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }

                scope.Complete();
            }

            request.data.tripExpense.ForEach(x =>
            {
                listData.ForEach(y =>
                {
                    if (x.vehicleTypeId == y.vehicleTypeId && x.uomCode == y.uomCode)
                    {
                        x.productVehicleTypeId = y.productVehicleTypeId;
                    }
                });
            });

            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 1

            ServiceBusRequest<string> sbusRequestFirebase = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.PRODUCT_VEHICLE_TYPE,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate,
                filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                action = request.action
            };

            List<string> jsonRequestFirebase = new() { sbusRequestFirebase.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE TRIP EXPENSE STATUS 1

            ServiceBusRequest<string> sbusRequestExpenseValue = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.TRIP_EXPENSE,
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

            List<string> jsonRequesExpenseEvent = new() { sbusRequestExpenseValue.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequesExpenseEvent);

            #endregion

            #region SEND MESSAGE TO SERVICE TRIP EXPENSE PERSISTOR

            List<CreateExpenseModel> TripExpense = new();
            List<expenseDetailModel> listExpenseDetail = new();

            TripExpense = request.data.tripExpense.Select(x => new CreateExpenseModel
            {
                productVehicleTypeId = x.productVehicleTypeId,
                routeId = x.routeId,
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

            foreach (var item in TripExpense)
            {
                var te = request.data.tripExpense.Where(x => x.productVehicleTypeId == item.productVehicleTypeId).FirstOrDefault();
                item.expenseDetail = te.expenseDetail.Select(x => new expenseDetailModel
                {
                    expenseCategoryId = x.expenseCategoryId,
                    value = x.value
                }).ToList();
            }

            ServiceBusRequest<List<CreateExpenseModel>> sbusMSSQLRequest = new()
            {
                data = TripExpense,
                entity = AppConst.TRIP_EXPENSE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_POST_ROUTE_TRIP_EXPENSE,
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
