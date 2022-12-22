namespace Sera.Application.Usecase
{
    public class CreateVehicleHandler : BaseHandler,
        IRequestHandler<CreateVehicleRequest, Response>
    {
        public CreateVehicleHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(CreateVehicleRequest request, CancellationToken cancellationToken)
        {
            Response response = new();
            int total = 0;

            //VALIDATE VEHICLETYPE CODE
            if (!string.IsNullOrWhiteSpace(request.vehicleTypeCode))
            {
                var isExists = await dbContext.VehicleType
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vehicleTypeCode == request.vehicleTypeCode.Trim() &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Type Code"));
                }
            }

            //VALIDATE LICENSE PLATE EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.licensePlate))
            {
                var isExists = await dbContext.Vehicle
                                              .AsNoTracking()
                                              .AnyAsync(x => x.licensePlate == request.licensePlate &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (isExists) // if exists
                {
                    return response.Fail(TransactionId, $"Licence Plate {request.licensePlate} is duplicated");
                }
            }

            //VALIDATE VIN EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.vin))
            {
                var isExists = await dbContext.Vehicle
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vin == request.vin &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (isExists) // if exists
                {
                    return response.Fail(TransactionId, $"VIN {request.vin} is duplicated");
                }
            }

            //VALIDATE VEHICLE CATEGORY ID
            if (request.vehicleCategoryId > 0)
            {
                var isExists = await dbContext.VehicleCategory
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vehicleCategoryId == request.vehicleCategoryId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Category Id"));
                }
            }

            //VALIDATE VEHICLE BRAND ID
            if (request.vehicleBrandId > 0)
            {
                var isExists = await dbContext.VehicleBrand
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vehicleBrandId == request.vehicleBrandId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Brand Id"));
                }
            }

            //VALIDATE VEHICLE MODEL ID
            if (request.vehicleModelId > 0)
            {
                var isExists = await dbContext.VehicleModel
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vehicleModelId == request.vehicleModelId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Model Id"));
                }
            }

            //VALIDATE VEHICLE COLOR ID
            if (request.vehicleColorId > 0)
            {
                var isExists = await dbContext.VehicleColor
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vehicleColorId == request.vehicleColorId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Vehicle Color Id"));
                }
            }

            //VALIDATE FUEL ID
            if (request.fuelTypeId > 0)
            {
                var isExists = await dbContext.FuelType
                                              .AsNoTracking()
                                              .AnyAsync(x => x.fuelTypeId == request.fuelTypeId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);
                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Fuel Type Id"));
                }
            }

            //BUILD VEHICLE COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),                
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
            ServiceBusRequest<CreateVehicleRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_VEHICLE,
                data = request,
                entity = "Vehicle",
                feURL = ClientURL,
                method = HTTPMethod.POST.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Vehicle"));
        }
    }
}
