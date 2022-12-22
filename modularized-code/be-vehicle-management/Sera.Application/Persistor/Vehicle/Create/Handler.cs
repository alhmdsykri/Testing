namespace Sera.Application.Persistor
{
    public class CreateVehicleHandler : BaseHandler,
                                        IRequestHandler<CreateVehicleRequest, IResultStatus>
    {
        public CreateVehicleHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateVehicleRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();
           
            int vehicleTypeId = await dbContext.VehicleType
                                               .AsNoTracking()
                                               .Where(x => x.vehicleTypeCode == request.data.vehicleTypeCode)
                                               .Select(x => x.vehicleTypeId)
                                               .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            //INSERT INTO SQL SERVER
            string uniqueKey = $"{request.data.vehicleTypeCode.ToLower()}{request.data.vin.ToLower()}";

            SQL.Vehicle entity = new();
            entity.vehicleTypeId = vehicleTypeId;
            entity.licensePlate = request.data.licensePlate;
            entity.vin = request.data.vin;
            entity.vehicleCategoryId = request.data.vehicleCategoryId;
            entity.vehicleBrandId = request.data.vehicleBrandId;
            entity.vehicleModelId = request.data.vehicleModelId;
            entity.vehicleColorId = request.data.vehicleColorId;
            entity.vehicleYear =  request.data.vehicleYear;
            entity.validFrom = request.data.validFrom;
            entity.validTo = request.data.validTo;
            entity.ownership = request.data.ownership;
            entity.fueltypeId = request.data.fuelTypeId;
            entity.transmission = request.data.transmission;
            entity.hasOBD = request.data.hasOBD;
            entity.businessUnitId = request.data.businessUnitId;
            entity.businessUnitCode = request.data.businessUnitCode;
            entity.businessUnitName = request.data.businessUnitName;
            entity.branchId = request.data.branchId;
            entity.branchCode = request.data.branchCode;
            entity.branchName = request.data.branchName;
            entity.locationId = request.data.locationId;
            entity.locationCode = request.data.locationCode;
            entity.locationName = request.data.locationName;
            entity.currentLocationId = request.data.locationId;// currentLocationId equal to locationid
            entity.currentLocationCode = request.data.locationCode;// currentLocationCode equal to locationCode
            entity.currentLocationName = request.data.locationName;// currentLocationName equal to locationName
            entity.vehicleStatus = (int)VehicleStatus.FREE;
            entity.referenceNumber = request.data.referenceNumber;
            entity.source = AppConst.VEHICLE_SOURCE;
            entity.status = (int)EventStatus.COMPLETED;
            entity.uniqueKey = uniqueKey;
            entity.version = AppConst.DATA_VERSION;
            entity.createdBy = request.username;
            entity.createdAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;

            await dbContext.Vehicle.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.VEHICLE_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
