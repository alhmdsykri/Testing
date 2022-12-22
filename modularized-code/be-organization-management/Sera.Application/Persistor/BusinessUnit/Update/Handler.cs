namespace Sera.Application.Persistor
{
    public class UpdateBusinessUnitHandler : BaseHandler,
                                       IRequestHandler<UpdateBusinessUnitRequest, IResultStatus>
    {
        public UpdateBusinessUnitHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateBusinessUnitRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region CHECK IF EXISTS
            SQL.BusinessUnit entity = await dbContext.BusinessUnit.FindAsync(request.data.businessUnitId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            //INSERT INTO SQL SERVER
            string uniqueKey = request.data.businessUnitCode ?? "null";
            uniqueKey = $"{uniqueKey}{request.data.businessUnitName.ToLower()}";

            entity.businessUnitCode = request.data.businessUnitCode;
            entity.businessUnitName = request.data.businessUnitName;
            entity.companyId = request.data.companyId;
            entity.sapIntegrated = request.data.sapIntegrated;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.uniqueKey = uniqueKey;

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
                action = request.action
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ORGANIZATION_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS USER

            if (request.data.isNameUpdated)
            {
                UpdateBusinessUnitCQRSRequest cqrsRequest = new();
                cqrsRequest.businessUnitId = request.data.businessUnitId;
                cqrsRequest.businessUnitCode = request.data.businessUnitCode;
                cqrsRequest.businessUnitName = request.data.businessUnitName;

                ServiceBusRequest<UpdateBusinessUnitCQRSRequest> sbusUserRequest = new()
                {
                    data = cqrsRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_BUSINESSUNIT_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_UPDATE_BUSINESSUNIT
                };

                List<string> jsonUserRequest = new() { sbusUserRequest.Serialize() };

                jsonUserRequest = new() { sbusUserRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_BUSINESSUNIT_USER_SUBS_FILTER_NAME,
                                               jsonUserRequest);
            }

            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.ORGANIZATION_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
