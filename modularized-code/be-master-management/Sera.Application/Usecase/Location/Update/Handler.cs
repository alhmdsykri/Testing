namespace Sera.Application.Usecase
{
    public class UpdateLocationHandler : BaseHandler,
        IRequestHandler<UpdateLocationRequest, Response>
    {
        public UpdateLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                     ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateLocationRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            var domain = await dbContext.Location.FindAsync(request.locationId);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Location"));
            }

            var isExists = await dbContext.Location
                                          .AsNoTracking()
                                          .AnyAsync(x => x.locationName == request.locationName.Trim() &&
                                                         x.locationId != request.locationId,
                                                    cancellationToken: cancellationToken);
            
            if (isExists)
            {
                return response.Fail(TransactionId, Message.Exist("Location"));
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "Location",
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
            ServiceBusRequest<UpdateLocationRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_LOCATION,
                data = request,
                entity = "Location",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Location"));
        }
    }
}