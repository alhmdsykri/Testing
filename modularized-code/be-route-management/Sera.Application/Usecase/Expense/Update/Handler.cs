using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Sera.Entity.SQL;

namespace Sera.Application.Usecase
{
    public class UpdateExpenseHandler : BaseHandler,
                                        IRequestHandler<UpdateExpenseRequest, Response>
    {
        public UpdateExpenseHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateExpenseRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            #region DATA VALIDATION

            //VALIDATE EXISTING ROUTE
            if (request.routeId > 0)
            {
                var route = await dbContext.Route
                                           .AsNoTracking()
                                           .AnyAsync(x => DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                                          x.routeId == request.routeId &&
                                                          x.status == (int)EventStatus.COMPLETED,
                                                          cancellationToken: cancellationToken);
                if (!route) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Route Id"));
                }
            }

            if (request.tripExpenseId > 0)
            {

                var tripExpense = dbContext.TripExpense
                                                 .AsNoTracking()
                                                 .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                                             x.tripExpenseId == request.tripExpenseId &&
                                                             x.status == (int)EventStatus.COMPLETED)
                                                 .Select(x => new {x.transactionId}).FirstOrDefault();

                if (tripExpense == null) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Trip Expense Id"));
                }

                var cosmosDbRouteExpense = await eventContext.GetAsync(tripExpense.transactionId, AppConst.TRIP_EXPENSE);

                if (cosmosDbRouteExpense.status != 2 || cosmosDbRouteExpense == null)
                {
                    return response.Fail(TransactionId, Message.ResourceLocking("Trip Expense Id"));
                }
            }

            //VALIDASI VEHICLETYPE ID NOT DUPLICATE
            var query = (from x in request.UpdateTripExpenseDetail
                         let temp = new
                         {
                             x.expenseCategoryId
                         }
                         group temp by new { x.expenseCategoryId })
                               .Where(g => g.Count() > 1)
                               .ToList();

            if (query.Count > 0)
            {
                foreach (var item in query)
                {
                    return response.Fail(TransactionId, $"expense category {item.Key.expenseCategoryId} is duplicated");
                }
            }

            //VALIDATE ONE OF THE CATEGORIES MUST BE GREATER THAN ZERO
            var iCntValue = 0;
            foreach (var itemCategory in request.UpdateTripExpenseDetail)
            {
                if (itemCategory.value > 0)
                {
                    iCntValue += 1;
                }
            }

            if (iCntValue == 0)
            {
                return response.Fail(TransactionId, Message.CategoryGreaterZero());
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE TRIP EXPENSE VALUE STATUS 1

            //BUILD CONTRACT COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = AppConst.TRIP_EXPENSE,
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            #endregion

            #region SEND TO SERVICE BUS MSSQL PERSISTOR

            ServiceBusRequest<UpdateExpenseRequest> sbusRequest = new()
            {
                data = request,
                entity = AppConst.TRIP_EXPENSE,
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                status = (int)EventStatus.INPROGRESS,
                username = UserId,
                transactionId = TransactionId,
                filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_TRIP_EXPENSE,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequestMSSQL = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequestMSSQL);
            #endregion MSSQL PERSISTOR

            return response.Success(TransactionId, Message.Accepted(AppConst.TRIP_EXPENSE));
        }
    }
}
