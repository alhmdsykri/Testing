namespace Sera.Application.Usecase
{
    public class DeleteLocationHandler : BaseHandler,
        IRequestHandler<DeleteVehicleRequest, Response>
    {
        public DeleteLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                     ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            DeleteVehicleRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            //VALIDATE VEHICLE ID EXISTING
            var domain = dbContext.Vehicle.Where(x => x.vehicleId == request.vehicleId &&
                                                      x.status == (int)EventStatus.COMPLETED)
                                          .FirstOrDefault();

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle"));
            }

            if (!string.IsNullOrWhiteSpace(domain.source) &&
                domain.source.Equals(DataSource.VM.ToString()))
            {
                return response.Fail(TransactionId, "You cannot delete vehicle data originated from VM");
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.DELETE.ToString(),
                entity = "Vehicle",
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
            ServiceBusRequest<DeleteVehicleRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_DELETE_VEHICLE,
                data = request,
                entity = "Vehicle",
                feURL = ClientURL,
                method = HTTPMethod.DELETE.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Vehicle"));
        }
    }
}