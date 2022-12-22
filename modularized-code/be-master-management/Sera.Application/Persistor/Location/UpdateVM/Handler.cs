namespace Sera.Application.Persistor
{
    public class UpdateLocationVMHandler : BaseHandler,
                                         IRequestHandler<UpdateLocationVMRequest, IResultStatus>
    {
        public UpdateLocationVMHandler(IDbContext dbContext, IMessage message, IRESTMasterClient masterClient,
                                       ICosmosContext eventContext, IRESTUserClient userclient)
               : base(dbContext, message, masterClient, eventContext, userclient)
        { }

        public async Task<IResultStatus> Handle(UpdateLocationVMRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region CONSTRUCT PAYLOAD
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = string.Empty,
                entity = "Location",
                feURL = string.Empty,
                method = HTTPMethod.PUT.ToString(),
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                source = "FleetX",
                username = request.userId,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate
            };
            UpdateLocationVMModel updateLocationVMModel = new()
            {
                locationCode = request.locationCode.ToString(),
                locationAddress = request.address,
                timeOffset = request.timeOffset
            };
            #endregion  

            #region GET DRBAC BUSINESS UNIT
            var drbacResponse = await userClient.GetDRBACAsync(request.transactionId, request.userId);
            #endregion

            #region GET MASTER DATA   
            var dataLocation = await dbContext.Location.AsNoTracking()
                                                       .FirstOrDefaultAsync(x => x.locationCode == request.locationCode.ToString() &&
                                                                            x.status == (int)EventStatus.COMPLETED, cancellationToken);
            #endregion

            #region CHECK BUSINESS RULE
            if (dataLocation == null)
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = updateLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = "Active location not exists";

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            if (!drbacResponse.Data.businessUnits.Contains(dataLocation.businessUnitId.Value))
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = updateLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = "UnAuthorized user on business unit";

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            #region CHECK RESOURCE LOCKING
            var cosmosData = await eventContext.GetAsync(dataLocation.transactionId, AppConst.ENTITY_LOCATION);

            if (cosmosData == null || cosmosData.status != 2)
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = updateLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.ResourceLocking("Location Code");

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            #region CHECK WHETHER LOCATION ALREADY USED
            var validResponse = await masterClient.GetLocationUsedAsync(request.transactionId, request.userId, dataLocation.locationId);

            if (validResponse.Data.isValid == true)
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = updateLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.UsedValidation("Location Code");

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion           

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS INPROGRESS    
            sbusRequest.data = updateLocationVMModel.Serialize();
            sbusRequest.filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.INPROGRESS;

            List<string> jsonRequestInprogress = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestInprogress);
            #endregion

            #region UPDATE SQL        

            var entity = await dbContext.Location.FindAsync(dataLocation.locationId);

            entity.locationAddress = request.address.ToString().Trim();    
            entity.source = "VM";
            entity.status = (int)EventStatus.COMPLETED;
            entity.timeOffset = updateLocationVMModel.timeOffset;          
            entity.createdBy = request.userId;
            entity.createdAt = DateTime.UtcNow;
            entity.modifiedBy = request.userId;
            entity.modifiedAt = DateTime.UtcNow;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion           

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS COMPLETED      
            sbusRequest.data = updateLocationVMModel.Serialize();
            sbusRequest.filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.COMPLETED;

            List<string> jsonRequestCompleted = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestCompleted);
            #endregion           

            #region SEND MESSAGE TO SERVICE BUS FIREBASE COMPLETED
            sbusRequest.data = updateLocationVMModel.Serialize();
            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.COMPLETED;
            sbusRequest.message = Message.UpdateSuccess("Location");

            List<string> jsonRequestFirebase = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}