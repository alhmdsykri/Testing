namespace Sera.Application.Persistor
{
    public class UpdateLocationHandler : BaseHandler,
                                         IRequestHandler<UpdateLocationRequest, IResultStatus>
    {
        public UpdateLocationHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //SPLIT STRING FOR CODE AND NAME
            char[] delimiterChars = { '-', '\t' };
            string? branchCode = null;
            string? branchName = null;
            string? buCode = null;
            string? buName = null;

            if (!string.IsNullOrWhiteSpace(request.data.businessUnitName))
            {
                string[] buCodeName = request.data.businessUnitName.Split(delimiterChars);
                buName = buCodeName[0]; //DEFAULT, THERE IS NO BU CODE, ONLY BU NAME

                if (buCodeName.Length > 1 && buCodeName.Length <= 2)
                {
                    buCode = buCodeName[0];
                    buName = buCodeName[1]; //DEFAULT

                    if (buCodeName.Length >= 3) //NOT FEASIBLE, THERE IS A POSSIBILITY THE CODE CONSIST OF 4 CHARS
                    {
                        buCode = null;
                        buName = $"{buCodeName[1]} - {buCodeName[2]}";
                    }
                }

                if (buCodeName.Length >= 3)
                {
                    buCode = buCodeName[0];
                    buName = $"{buCodeName[1]} - {buCodeName[2]}"; //NOT FEASIBLE, THERE IS A POSSIBILITY BU NAME CONSIST OF MORE THAN 1 DASH (-) CHARS
                }
            }

            if (!string.IsNullOrWhiteSpace(request.data.branchName))
            {
                string[] branchCodeName = request.data.branchName.Split(delimiterChars);
                branchName = branchCodeName[0]; //DEFAULT, THERE IS NO BRANCH CODE, ONLY BRANCH NAME

                if (branchCodeName.Length > 1 && branchCodeName.Length <= 2)
                {
                    branchCode = branchCodeName[0];
                    branchName = branchCodeName[1];

                    if (branchCode.Trim().Length > 4) //NOT FEASIBLE, THERE IS A POSSIBILITY THE CODE CONSIST OF 4 CHARS
                    {
                        branchCode = null;
                        branchName = $"{branchCodeName[0]} - {branchCodeName[1]}"; //DEFAULT
                    }
                }

                if (branchCodeName.Length >= 3)
                {
                    branchCode = branchCodeName[0];
                    branchName = $"{branchCodeName[1]} - {branchCodeName[2]}"; //NOT FEASIBLE, THERE IS A POSSIBILITY BRANCH NAME CONSIST OF MORE THAN 1 DASH (-) CHARS
                }
            }

            //UPDATE LOCATION
            var entity = await dbContext.Location.FindAsync(request.data.locationId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.branchId = request.data.branchId;
            entity.branchCode = branchCode;
            entity.branchName = branchName;
            entity.businessUnitId = request.data.businessUnitId;
            entity.businessUnitCode = buCode;
            entity.businessUnitName = buName;
            entity.cicoPoolType = request.data.cicoPoolType;
            entity.customerContractId = request.data.customerContractId;
            entity.customerId = request.data.customerId;
            entity.latitude = Math.Round(request.data.latitude, 8);
            entity.locationAddress = request.data.locationAddress;
            entity.locationName = request.data.locationName;
            entity.locationTypeId = request.data.locationTypeId;
            entity.longitude = Math.Round(request.data.longitude, 8);
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.COMPLETED;
            entity.timeOffset = request.data.timeOffset;
            entity.storeCode = request.data.storeCode;
            entity.workingHour = request.data.workingHour;
            entity.parentLocationId = request.data.parentLocationId;
            entity.vendorId = request.data.vendorId;
            entity.radius = request.data.radius;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region SEND MESSAGE TO SERVICE BUS CQRS USER & ROUTE

            if (request.data.isNameUpdated)
            {
                #region CQRS USER
                UpdateLocationCQRSRequest cqrsRequest = new();
                cqrsRequest.locationId = request.data.locationId;
                cqrsRequest.locationName = request.data.locationName;

                ServiceBusRequest<UpdateLocationCQRSRequest> sbusUserRequest = new()
                {
                    data = cqrsRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_UPDATE_LOCATION,
                    startDate = DateTime.UtcNow, //[REVISIT]
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
                };

                List<string> jsonUserRequest = new() { sbusUserRequest.Serialize() };

                jsonUserRequest = new() { sbusUserRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_FILTER_NAME,
                                               jsonUserRequest);
                #endregion

                #region CQRS ROUTE
                UpdateRouteCQRSRequest cqrsRouteRequest = new();
                cqrsRouteRequest.locationId = request.data.locationId;
                cqrsRouteRequest.locationName = request.data.locationName;
                cqrsRouteRequest.locationTypeId = request.data.locationTypeId;
                cqrsRouteRequest.latitude = request.data.latitude;
                cqrsRouteRequest.longitude = request.data.longitude;

                ServiceBusRequest<UpdateRouteCQRSRequest> sbusRouteRequest = new()
                {
                    data = cqrsRouteRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_LOCATION_ROUTE_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_ROUTE_CQRS_UPDATE_LOCATION,
                    startDate = DateTime.UtcNow, //[REVISIT]
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
                };

                List<string> jsonRouteRequest = new() { sbusRouteRequest.Serialize() };

                jsonRouteRequest = new() { sbusRouteRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_LOCATION_ROUTE_SUBS_FILTER_NAME,
                                               jsonRouteRequest);
                #endregion

                #region CQRS VEHICLE  
                UpdateVehicleCQRSRequest cqrsVehicleRequest = new();
                cqrsVehicleRequest.locationId = request.data.locationId;
                cqrsVehicleRequest.locationName = request.data.locationName;

                ServiceBusRequest<UpdateVehicleCQRSRequest> sbusVehicleRequest = new()
                {
                    data = cqrsVehicleRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_LOCATION_VEHICLE_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_VEHICLE_CQRS_UPDATE_LOCATION,
                    startDate = DateTime.UtcNow, //[REVISIT]
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
                };

                List<string> jsonVehicleRequest = new() { sbusVehicleRequest.Serialize() };

                jsonVehicleRequest = new() { sbusVehicleRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_LOCATION_VEHICLE_SUBS_FILTER_NAME,
                                               jsonVehicleRequest);

                #endregion
            }
            #endregion

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
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}