namespace Sera.Application.Usecase
{
    public class UpdateVehicleTypeHandler : BaseHandler,
                 IRequestHandler<UpdateVehicleTypeRequest, Response>
    {
        public UpdateVehicleTypeHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                        ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateVehicleTypeRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

            // Validate Vehicle Type Id Existing
            var domain = await dbContext.VehicleType
                                        .Where(x => x.vehicleTypeId == request.vehicleTypeId &&
                                                    x.status == (int)EventStatus.COMPLETED)
                                        .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vehicle Type Id"));
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "Vehicle Type",
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
            ServiceBusRequest<UpdateVehicleTypeRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_VEHICLE_TYPE,
                data = request,
                entity = "Vehicle Type",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Vehicle Type"));
        }
    }
}
