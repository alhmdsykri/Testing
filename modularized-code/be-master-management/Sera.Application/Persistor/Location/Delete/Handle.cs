namespace Sera.Application.Persistor
{
    public class DeleteLocationHandler : BaseHandler,
                                         IRequestHandler<DeleteLocationRequest, IResultStatus>
    {
        public DeleteLocationHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(DeleteLocationRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //RETRIEVE SQL SERVER
            SQL.Location entity = await dbContext.Location.FindAsync(request.data.locationId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            //UPDATE SQL SERVER
            entity.status = (int)EventStatus.DELETED;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region CQRS USER

            // DELETE IN ROLE POSITION ONLY LOCATION TYPE POOL, SUB POOL AND CUSTOMER LOCATION
            if (entity.locationTypeId == (int)LocationType.POOL || entity.locationTypeId == (int)LocationType.SUBPOOL||
                entity.locationTypeId == (int)LocationType.CUSTOMERPOOL)
            {
                DeleteLocationModel cqrsRequest = new();
                cqrsRequest.locationId = request.data.locationId;

                ServiceBusRequest<DeleteLocationModel> sbusUserRequest = new()
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
                    action = AppConst.FA_ACTION_CQRS_DELETE_LOCATION,
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

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.DELETED,
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