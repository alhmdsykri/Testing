using Sera.Entity.SQL;

namespace Sera.Application.Persistor
{
    public class UpdateTripExpenseHandler : BaseHandler, IRequestHandler<UpdateTripExpenseRequest, IResultStatus>
    {
        public UpdateTripExpenseHandler(IDbContext dbContext, IMessage message) : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateTripExpenseRequest request,CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE TRIP 

            var entity = await dbContext.TripExpense.FindAsync(request.data.tripExpenseId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.transactionId = request.transactionId;
            entity.totalExpense = request.data.totalExpense;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.INPROGRESS;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 1

            ServiceBusRequest<string> sbusRequest = new()
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
                filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                action = request.action
            };

            List<string> jsonRequestFirebase = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE EXPENSE VALUE STATUS 1

            ServiceBusRequest<string> sbusRequestExpenseValue = new()
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

            List<string> jsonRequesExpenseEvent = new() { sbusRequestExpenseValue.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequesExpenseEvent);

            #endregion

            #region SEND MESSAGE TO SERVICE EXPENSE VALUE PERSISTOR

            List<updateExpenseValueExpenseDetailModel> UpdateExpenseDetailValueData = new();

            UpdateExpenseValueModel updateExpenseValue = new()
            {
                routeId = request.data.routeId,
                tripExpenseId = request.data.tripExpenseId,
                totalExpense = request.data.totalExpense,
                revenue = request.data.revenue,
                COGS = request.data.COGS,
                distance = request.data.distance
            };

            UpdateExpenseDetailValueData = request.data.updateTripExpenseDetail.Select(x => new updateExpenseValueExpenseDetailModel
            {
                expenseCategoryId = x.expenseCategoryId,
                value = x.value
            }).ToList();

            updateExpenseValue.updateExpenseValueExpenseDetail = UpdateExpenseDetailValueData;

            ServiceBusRequest<UpdateExpenseValueModel> sbusMSSQLRequest = new()
            {
                data = updateExpenseValue,
                entity = AppConst.EXPENSE_VALUE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_EXPENSE_VALUE,
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
