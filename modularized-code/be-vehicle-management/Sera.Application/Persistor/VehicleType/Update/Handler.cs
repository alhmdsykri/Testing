namespace Sera.Application.Persistor
{
    public class UpdateVehicleTypeHandler :
        BaseHandler, IRequestHandler<UpdateVehicleTypeRequest, IResultStatus>
    {
        public UpdateVehicleTypeHandler(IDbContext dbContext, IMessage message)
            : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateVehicleTypeRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //UPDATE DATA VEHICLE TYPE
            var entity = await dbContext.VehicleType.FindAsync(request.data.vehicleTypeId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.vehicleTypeId = request.data.vehicleTypeId;
            entity.driverLicenseTypeId = request.data.driverLicenseTypeId;
            entity.driverLicenseTypeCode = request.data.driverLicenseTypeCode;
            entity.driverLicenseTypeName = request.data.driverLicenseTypeName;
            entity.description = request.data.description;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.COMPLETED;

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
