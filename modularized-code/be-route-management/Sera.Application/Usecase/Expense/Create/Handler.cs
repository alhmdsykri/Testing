using System.Runtime.CompilerServices;

namespace Sera.Application.Usecase
{
    public class CreateTripExpenseHandler : BaseHandler,
        IRequestHandler<CreateExpenseRequest, Response>
    {
        public CreateTripExpenseHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                        ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(CreateExpenseRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            #region DATA VALIDATION

            //VALIDATE VEHICLETYPE ID AND UOM CODE NOT DUPLICATE IN REQUEST
            var query = (from x in request.tripExpense
                         let temp = new
                         {
                             x.routeId,
                             x.vehicleTypeId,
                             x.vehicleTypeName,
                             x.uomCode
                         }
                         group temp by new { x.routeId, x.vehicleTypeId, x.vehicleTypeName, x.uomCode })
                               .Where(g => g.Count() > 1)
                               .ToList();

            if (query.Count > 0)
            {
                foreach (var itemquery in query)
                {
                    return response.Fail(TransactionId, Message.ExpenseDuplicate(itemquery.Key.vehicleTypeName + " and UOM " + itemquery.Key.uomCode));

                }
            }

            foreach (var item in request.tripExpense)
            {
                //VALIDATE EXISTING ROUTE
                if (item.routeId > 0)
                {
                    var route = await dbContext.Route
                                               .AsNoTracking()
                                               .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) &&
                                                              x.routeId == item.routeId &&
                                                              x.status == (int)EventStatus.COMPLETED)
                                               .FirstOrDefaultAsync(cancellationToken: cancellationToken);

                    if (route == null) //if not exists
                    {
                        return response.Fail(TransactionId, Message.NotFound("Route Id"));
                    }

                    item.businessUnitId = route.businessUnitId;
                }

                //VALIDATE ONE OF THE CATEGORIES MUST BE GREATER THAN ZERO
                var iCntValue = 0;
                foreach (var itemCategory in item.expenseDetail)
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

                //VALIDATE VEHICLETYPE ID AND UOM CODE NOT DUPLICATE IN DATABASE
                foreach (var itemCategory in item.expenseDetail)
                {
                    var expensecategory = await dbContext.TripExpense
                                                         .AsNoTracking()
                                                         .Include(y => y.ProductVehicleType)
                                                         .AnyAsync(x => x.routeId == item.routeId &&
                                                                        x.ProductVehicleType.vehicleTypeId == item.vehicleTypeId &&
                                                                        x.ProductVehicleType.uomCode == item.uomCode &&
                                                                        x.ExpenseValue.expenseId == itemCategory.expenseCategoryId &&
                                                                        x.status == (int)EventStatus.COMPLETED,
                                                                        cancellationToken: cancellationToken);
                    if (expensecategory)
                    {
                        return response.Fail(TransactionId, Message.ExpenseDuplicateInDB(item.vehicleTypeCode + " " + item.vehicleTypeName));
                    }
                }

            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE ROUTE EVENT SOURCE PRODUCT TYPE VALUE STATUS 1

            //BUILD CONTRACT COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = AppConst.PRODUCT_VEHICLE_TYPE,
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

            ServiceBusRequest<CreateExpenseRequest> sbusRequest = new()
            {
                data = request,
                entity = AppConst.PRODUCT_VEHICLE_TYPE,
                feURL = ClientURL,
                method = HTTPMethod.POST.ToString(),
                source = SourceURL,
                status = (int)EventStatus.INPROGRESS,
                username = UserId,
                transactionId = TransactionId,
                filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                action = AppConst.FA_ACTION_POST_ROUTE_PRODUCT_VEHICLE_TYPE,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);



            #endregion

            return response.Success(TransactionId, Message.Accepted(AppConst.TRIP_EXPENSE));
        }
    }
}
