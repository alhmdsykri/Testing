
using System.Linq;

namespace Sera.Application.Persistor
{
    public class UpdateCompletionStatusFromUpdateTripExpenseHandler : BaseHandler,
                                                 IRequestHandler<UpdateCompletionStatusFromUpdateTripExpenseRequest, IResultStatus>
    {
        public UpdateCompletionStatusFromUpdateTripExpenseHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateCompletionStatusFromUpdateTripExpenseRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE COMPLETION STATUS TO ROUTE

            var entity = await dbContext.Route.FindAsync(request.data.routeId);

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

            #region SEND MESSAGE TO SERVICE BUS TRIP EXPENSE STATUS PERSISTOR

            List<SingelUpdateExpenseStatusDetailModel> UpdateCompletionStatusDetail = new();

            SingelUpdateExpenseStatusModel SingelUpdateExpenseStatus = new()
            {
                routeId = request.data.routeId,
                tripExpenseId = request.data.tripExpenseId,
                totalExpense = request.data.totalExpense,
                revenue = request.data.revenue,
                COGS = request.data.COGS,
                distance = request.data.distance
            };

            UpdateCompletionStatusDetail = request.data.UpdateCompletionStatusDetailFromUpdateTripExpense.Select(x => new SingelUpdateExpenseStatusDetailModel
            {
                expenseCategoryId = x.expenseCategoryId,
                value = x.value
            }).ToList();

            SingelUpdateExpenseStatus.SingelUpdateExpenseStatusDetail = UpdateCompletionStatusDetail;

            ServiceBusRequest<SingelUpdateExpenseStatusModel> sbusMSSQLRequest = new()
            {
                data = SingelUpdateExpenseStatus,
                entity = AppConst.TRIP_EXPENSE,
                feURL = request.feURL,
                source = request.source,
                method = request.method,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_STATUS_SINGLE_TRIPEXPENSE,
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
