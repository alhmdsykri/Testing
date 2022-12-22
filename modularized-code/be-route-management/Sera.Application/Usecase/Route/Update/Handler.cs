namespace Sera.Application.Usecase
{
    public class UpdateRouteDetailFMSHandler : BaseHandler, IRequestHandler<UpdateRouteDetailFMSRequest, Response>
    {
        public UpdateRouteDetailFMSHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateRouteDetailFMSRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

            // Validate Product Id Existing
            if (request.routeId > 0)
            {
                var domain = dbContext.Route
                                      .Where(x => x.routeId == request.routeId &&
                                                  x.status == (int)EventStatus.COMPLETED)
                                      .FirstOrDefault();

                if (domain == null)
                {
                    return response.Fail(TransactionId, Message.NotFound("Route Id"));
                }
            }            

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "Route",
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            //SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<UpdateRouteDetailFMSRequest> sbusRequest = new()
            { 
                data = request,
                entity = "Route",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                status = (int)EventStatus.INPROGRESS,
                username = UserId,
                transactionId = TransactionId,
                filter = AppConst.SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME,
                action = AppConst.FA_ACTION_PUT_ROUTE_FMS,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ROUTES_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Route"));
        }
    }
}
