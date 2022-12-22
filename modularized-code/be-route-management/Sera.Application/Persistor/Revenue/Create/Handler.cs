using Sera.Entity.SQL;

namespace Sera.Application.Persistor
{
    public class CreateRevenueHandler : BaseHandler,
                                              IRequestHandler<CreateRevenueRequest, IResultStatus>
    {
        public CreateRevenueHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateRevenueRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region INSERT TO REVENUE

            List<SQL.Revenue> listData = new();

            TransactionOptions options = new TransactionOptions();
            options.IsolationLevel = IsolationLevel.ReadCommitted;
            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                 TransactionScopeAsyncFlowOption.Enabled))
            {

                foreach (var item in request.data)
                {
                    SQL.Revenue entity = new();

                    entity.tripExpenseId = item.tripExpenseId;
                    entity.revenue = item.revenue;
                    entity.distance = item.distance;
                    entity.totalRevenue = 0;
                    entity.totalExpense = item.totalExpense;
                    entity.COGS = item.COGS;
                    entity.status = (int)EventStatus.COMPLETED;
                    entity.createdBy = request.username;
                    entity.createdAt = DateTime.UtcNow;
                    entity.modifiedBy = request.username;
                    entity.modifiedAt = DateTime.UtcNow;
                    entity.transactionId = request.transactionId;

                    listData.Add(entity);
                };

                await dbContext.Revenue.AddRangeAsync(listData, cancellationToken);

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }

                scope.Complete();
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE REVENUE VALUE STATUS 2

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

            ServiceBusRequest<string> sbusRequestRevenue = new()
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

            List<string> jsonRequesRevenuetEvent = new() { sbusRequestRevenue.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequesRevenuetEvent);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS UPDATE ROUTE COMPLETION STATUS PERSISTOR

            List<UpdateCompletionStatusFromTripexpenseModel> UpdateCompletiontatus = new();
            List<UpdateProductVehicleTypeDetailModel> listExpenseDetail = new();

            UpdateCompletiontatus = request.data.Select(x => new UpdateCompletionStatusFromTripexpenseModel
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

            foreach (var item in UpdateCompletiontatus)
            {
                var te = request.data.Where(x => x.tripExpenseId == item.tripExpenseId).FirstOrDefault();
                item.UpdateCompletionStatusDetailFromTripExpense = te.RevenueExpenseDetail.Select(x => new UpdateCompletionStatusDetailFromTripExpenseModel
                {
                    expenseCategoryId = x.expenseCategoryId,
                    value = x.value
                }).ToList();
            }

            ServiceBusRequest<List<UpdateCompletionStatusFromTripexpenseModel>> sbusMSSQLRequest = new()
            {
                data = UpdateCompletiontatus,
                entity = AppConst.ROUTE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_COMPLETION_STATUS,
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
