namespace Sera.Application.Usecase
{
    public class UpdateRouteLocationActivitiesHandler : BaseHandler, IRequestHandler<UpdateRouteLocationActivitiesRequest, Response>
    {
        public UpdateRouteLocationActivitiesHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateRouteLocationActivitiesRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

            // Validate RouteLocation Id Existing
            if (request.routeLocationId > 0)
            {
                var domain = await dbContext.RouteLocation
                                      .AsNoTracking()
                                      .AnyAsync(x => x.routeLocationId == request.routeLocationId &&
                                                  x.status == (int)EventStatus.COMPLETED,
                                                   cancellationToken: cancellationToken);

                if (!domain)
                {
                    return response.Fail(TransactionId, Message.NotFound("Route Location Id"));
                }
            }

            // Validate Route Action Id Existing
            if (request.routeActionId > 0)
            {
                var existRouteAction = await dbContext.RouteAction
                                      .AsNoTracking()
                                      .AnyAsync(x => x.routeActionId == request.routeActionId &&
                                                  x.status == (int)EventStatus.COMPLETED,
                                                   cancellationToken: cancellationToken);

                if (!existRouteAction)
                {
                    return response.Fail(TransactionId, Message.NotFound("Route Action Id"));
                }
            }
           
            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = AppConst.ROUTE_LOCATION,
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB - Route Location
            await eventContext.CreateAsync(collection);

            //SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<UpdateRouteLocationActivitiesRequest> sbusRequest = new()
            { 
                data = request,
                entity = AppConst.ROUTE_LOCATION,
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                status = (int)EventStatus.INPROGRESS,
                username = UserId,
                transactionId = TransactionId,
                filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ACTIVITY_ROUTE_LOCATION,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Route Location"));
        }
    }
}
