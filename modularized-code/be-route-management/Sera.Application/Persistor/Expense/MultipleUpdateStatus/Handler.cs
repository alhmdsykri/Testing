using static System.Formats.Asn1.AsnWriter;

namespace Sera.Application.Persistor
{
    public class MultipleUpdatetripExpenseStatusHandler : BaseHandler,
                                                        IRequestHandler<MultipleUpdateTripExpenseStatusRequest, IResultStatus>
    {
        public MultipleUpdatetripExpenseStatusHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(MultipleUpdateTripExpenseStatusRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE TO STATUS TRIPEXPENSE

            var entity = await dbContext.TripExpense
                                        .Where(x => request.data.Select(y => y.tripExpenseId).Contains(x.tripExpenseId))
                                        .ToListAsync();

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            if (entity.Count() > 0)
            {

                TransactionOptions options = new TransactionOptions();
                options.IsolationLevel = IsolationLevel.ReadCommitted;
                using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, options,
                                                                     TransactionScopeAsyncFlowOption.Enabled))
                {
                    entity.ForEach(x =>
                    {
                        x.status = (int)EventStatus.COMPLETED;
                        x.modifiedAt = DateTime.UtcNow;
                        x.modifiedBy = request.username;
                        x.transactionId = request.transactionId;
                    });

                    if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                    {
                        return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                    }

                    scope.Complete();

                }

            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE TRIP EXPENSE STATUS 2
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.TRIP_EXPENSE,
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

            #region SEND MESSAGE TO SERVICE BUS PRODUCT VEHICLE TYPE STATUS PERSISTOR

            List<UpdateProductVehicleTypeStatusModel> UpdateProductVehicleTypeStatus = new();
            List<UpdateProductVehicleTypeDetailModel> listExpenseDetail = new();

            UpdateProductVehicleTypeStatus = request.data.Select(x => new UpdateProductVehicleTypeStatusModel
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

            foreach (var item in UpdateProductVehicleTypeStatus)
            {
                var te = request.data.Where(x => x.tripExpenseId == item.tripExpenseId).FirstOrDefault();
                item.UpdateProductVehicleTypeDetail = te.MultipleUpdateExpenseStatusDetail.Select(x => new UpdateProductVehicleTypeDetailModel
                {
                    expenseCategoryId = x.expenseCategoryId,
                    value = x.value
                }).ToList();
            }

            ServiceBusRequest<List<UpdateProductVehicleTypeStatusModel>> sbusMSSQLRequest = new()
            {
                data = UpdateProductVehicleTypeStatus,
                entity = AppConst.PRODUCT_VEHICLE_TYPE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_STATUS_PRODUCT_VEHICLE_TYPE,
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
