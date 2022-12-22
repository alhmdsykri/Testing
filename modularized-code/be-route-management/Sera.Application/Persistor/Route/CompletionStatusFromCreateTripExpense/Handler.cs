namespace Sera.Application.Persistor
{
    public class UpdateCompletionStatusFromTripExpenseHandler : BaseHandler,
                                                 IRequestHandler<UpdateCompletionStatusFromTripExpenseRequest, IResultStatus>
    {
        public UpdateCompletionStatusFromTripExpenseHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateCompletionStatusFromTripExpenseRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE COMPLETION STATUS TO ROUTE

            var routeId = request.data.Select(x => x.routeId).FirstOrDefault();

            var entity = await dbContext.Route.FindAsync(routeId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.completionStatus = (int)CompletionStatus.INPROGRESS;
            entity.transactionId = request.transactionId;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.COMPLETED;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT ROUTE STATUS 2

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = AppConst.ROUTE,
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

            #region SEND MESSAGE TO SERVICE BUS MULTIPLE UPDATE TRIP EXPENSE  STATUS PERSISTOR

            List<MultipleUpdateExpenseStatusModel> MultipleUpdateExpenseStatus = new();
            List<MultipleUpdateExpenseStatusDetailModel> listExpenseDetail = new();

            MultipleUpdateExpenseStatus = request.data.Select(x => new MultipleUpdateExpenseStatusModel
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

            foreach (var item in MultipleUpdateExpenseStatus)
            {
                var te = request.data.Where(x => x.tripExpenseId == item.tripExpenseId).FirstOrDefault();
                item.MultipleUpdateExpenseStatusDetail = te.UpdateCompletionStatusDetailFromTripExpense.Select(x => new MultipleUpdateExpenseStatusDetailModel
                {
                    expenseCategoryId = x.expenseCategoryId,
                    value = x.value
                }).ToList();
            }

            ServiceBusRequest<List<MultipleUpdateExpenseStatusModel>> sbusMSSQLRequest = new()
            {
                data = MultipleUpdateExpenseStatus,
                entity = AppConst.TRIP_EXPENSE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_STATUS_MULTIPLE_TRIP_EXPENSE,
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
