using Sera.Application.Usecase;

namespace Sera.Application.Persistor
{
    public class DeleteLocationVMHandler : BaseHandler,
                                           IRequestHandler<DeleteLocationVMRequest, IResultStatus>
    {
        public DeleteLocationVMHandler(IDbContext dbContext, IMessage message, IRESTMasterClient masterClient,
                                       ICosmosContext eventContext, IRESTUserClient userclient)
               : base(dbContext, message, masterClient, eventContext, userclient)
        { }

        public async Task<IResultStatus> Handle(DeleteLocationVMRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();
            List<string> jsonRequest = null;

            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.Serialize(),
                entity = "Location",
                feURL = string.Empty,
                action = request.action,
                method = HTTPMethod.DELETE.ToString(),
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                source = "FleetX",
                username = request.userId,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate
            };

            var drbacResponse = await userClient.GetDRBACAsync(request.transactionId, request.userId);

            var dataLocation = await dbContext.Location.AsNoTracking()
                                              .FirstOrDefaultAsync(x => drbacResponse.Data.businessUnits.Contains(x.businessUnitId.Value) &&
                                                                   x.locationCode == request.locationCode &&
                                                                   x.status == (int)EventStatus.COMPLETED &&
                                                                   x.source == LocationSource.VM.ToString(), cancellationToken);
            if (dataLocation == null)
            {
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.NotExist("Location Code or UnAuthorized User Or Incomplete Clasification");

                jsonRequest = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequest);

                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            var cosmosData = await eventContext.GetAsync(dataLocation.transactionId, AppConst.ENTITY_LOCATION);

            if (cosmosData.status != 2 || cosmosData == null)
            {
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.ResourceLocking("Location Code");

                jsonRequest = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequest);

                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            var validResponse = await masterClient.GetLocationUsedAsync(request.transactionId, request.userId, dataLocation.locationId);

            if (validResponse.Data.isValid == true)
            {
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.UsedValidation("Location Code");

                jsonRequest = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequest);

                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region SEND TO COSMOS IN PROGRESS
            sbusRequest.filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.INPROGRESS;

            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                               jsonRequest);
            #endregion

            #region DELETE OR UPDATE LOCATION IN SQL
            SQL.Location entity = await dbContext.Location.FindAsync(dataLocation.locationId);
            entity.status = (int)EventStatus.DELETED;
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.userId;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            #region CQRS USER

            // DELETE IN ROLE POSITION ONLY LOCATION TYPE POOL, SUB POOL AND CUSTOMER POOL
            if (entity.locationTypeId == (int)LocationType.POOL || entity.locationTypeId == (int)LocationType.SUBPOOL ||
                entity.locationTypeId == (int)LocationType.CUSTOMERPOOL)
            {
                DeleteLocationCQRSRequest cqrsRequest = new();
                cqrsRequest.locationId = dataLocation.locationId;

                ServiceBusRequest<DeleteLocationCQRSRequest> sbusUserRequest = new()
                {
                    data = cqrsRequest,
                    entity = AppConst.LOCATION,
                    feURL = string.Empty,
                    method = HTTPMethod.DELETE.ToString(),
                    filter = AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_DELETE_LOCATION,
                    source = AppConst.FLEETX,
                    username = request.userId,
                    transactionId = request.transactionId,
                    startDate = DateTime.UtcNow, //[REVISIT]
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
                };

                List<string> jsonUserRequest = new() { sbusUserRequest.Serialize() };

                jsonUserRequest = new() { sbusUserRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_FILTER_NAME,
                                               jsonUserRequest);
            }
            #endregion

            #region SEND TO COSMOS & FIREBASE COMPLETED
            sbusRequest.filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.COMPLETED;

            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                               jsonRequest);

            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}