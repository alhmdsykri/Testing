namespace Sera.Application.Usecase
{
    public class CreateLocationHandler : BaseHandler,
        IRequestHandler<CreateLocationRequest, Response>
    {
        public CreateLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                     ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            CreateLocationRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            //VALIDATE LOCATION NAME EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.locationName))
            {
                var isExists = await dbContext.Location
                                              .AsNoTracking()
                                              .AnyAsync(x => x.locationName == request.locationName.Trim(),
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Location"));
                }
            }

            //VALIDATE LOCATION TYPE ID AND VENDOR ID
            if (request.locationTypeId > 0)
            {
                if (!await dbContext.LocationType.AnyAsync(x => x.locationTypeId == request.locationTypeId,
                                                                cancellationToken: cancellationToken))
                {
                    return response.Fail(TransactionId, Message.NotFound("Location Type Id"));
                }
            }

            if (request.vendorId.HasValue)
            {
                if (!await dbContext.Vendor.AnyAsync(x => x.vendorId == request.vendorId,
                                                          cancellationToken: cancellationToken))
                {
                    return response.Fail(TransactionId, Message.NotFound("Vendor Id"));
                }
            }

            //VALIDATE PARENTE LOCATION EXISTENCE
            int? parentLocationId = request.parentLocationId.HasValue &&
                                    request.parentLocationId.Value > 0 ? request.parentLocationId : null;

            if (parentLocationId.HasValue)
            {
                if (!await dbContext.Location.AnyAsync(x => x.locationId == parentLocationId,
                                                            cancellationToken: cancellationToken))
                {
                    return response.Fail(TransactionId, Message.NotFound("Parent Location"));
                }
            }                   

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
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
            ServiceBusRequest<CreateLocationRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_LOCATION,
                data = request,
                entity = "Location",
                feURL = ClientURL,
                method = HTTPMethod.POST.ToString(),
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