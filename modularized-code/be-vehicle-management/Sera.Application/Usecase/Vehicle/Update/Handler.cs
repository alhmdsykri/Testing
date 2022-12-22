namespace Sera.Application.Usecase
{
    public class UpdateVehicleHandler : BaseHandler,
                 IRequestHandler<UpdateVehicleRequest, Response>
    {
        public UpdateVehicleHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateVehicleRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

            // VALIDATE EXISTING VEHICLE ID
            if (request.vehicleId > 0)
            {
                var isExists = await dbContext.Vehicle
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vehicleId == request.vehicleId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);

                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotExist("Vehicle Id"));
                }
            }

            //VALIDATE LICENSE PLATE EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.licensePlate))
            {
                var isExists = await dbContext.Vehicle
                                              .AsNoTracking()
                                              .AnyAsync(x => x.licensePlate == request.licensePlate &&
                                                             x.vehicleId != request.vehicleId,
                                                        cancellationToken: cancellationToken);

                if (isExists) // if exists
                {
                    return response.Fail(TransactionId, Message.Exist("Licence Plate"));
                }
            }

            //VALIDATE VIN EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.vin))
            {
                var isExists = await dbContext.Vehicle
                                              .AsNoTracking()
                                              .AnyAsync(x => x.vin == request.vin &&
                                                             x.vehicleId != request.vehicleId,
                                                        cancellationToken: cancellationToken);

                if (isExists) // if exists
                {
                    return response.Fail(TransactionId, Message.Exist("VIN"));
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
                    return response.Fail(TransactionId, Message.NotExist("Vehicle Category Id"));
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
                    return response.Fail(TransactionId, Message.NotExist("Vehicle Brand Id"));
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
                    return response.Fail(TransactionId, Message.NotExist("Vehicle Model Id"));
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
                    return response.Fail(TransactionId, Message.NotExist("Vehicle Color Id"));
                }
            }

            //VALIDATE FUEL ID
            if (request.fueltypeId > 0)
            {
                var isExists = await dbContext.FuelType
                                              .AsNoTracking()
                                              .AnyAsync(x => x.fuelTypeId == request.fueltypeId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);

                if (!isExists) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotExist("Fuel Type Id"));
                }
            }

            //BUILD VEHICLE COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
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
            ServiceBusRequest<UpdateVehicleRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_VEHICLE,
                data = request,
                entity = "Vehicle",
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

            return response.Success(TransactionId, Message.Accepted("Vehicle"));
        }
    }
}
