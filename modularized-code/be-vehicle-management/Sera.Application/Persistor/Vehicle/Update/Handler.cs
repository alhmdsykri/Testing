namespace Sera.Application.Persistor
{
    public class UpdateVehicleHandler : BaseHandler,
                                        IRequestHandler<UpdateVehicleRequest, IResultStatus>
    {
        public UpdateVehicleHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateVehicleRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //UPDATE DATA VEHICLE
            SQL.Vehicle entity = await dbContext.Vehicle.FindAsync(request.data.vehicleId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.licensePlate = request.data.licensePlate;
            entity.vin = request.data.vin;
            entity.vehicleCategoryId = request.data.vehicleCategoryId;
            entity.vehicleBrandId = request.data.vehicleBrandId;
            entity.vehicleModelId = request.data.vehicleModelId;
            entity.vehicleColorId = request.data.vehicleColorId;
            entity.vehicleYear = request.data.vehicleYear;
            entity.validFrom = request.data.validFrom;
            entity.validTo = request.data.validTo;
            entity.fueltypeId = request.data.fueltypeId;
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
            entity.referenceNumber = request.data.referenceNumber;
            entity.status = (int)EventStatus.COMPLETED;
            entity.version = AppConst.DATA_VERSION;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;

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
