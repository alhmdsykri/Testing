namespace Sera.Application.Persistor
{
    public class UpdateCompanyHandler : BaseHandler,
                                        IRequestHandler<UpdateCompanyRequest, IResultStatus>
    {
        public UpdateCompanyHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateCompanyRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //RETRIEVE SQL SERVER
            SQL.Company entity = await dbContext.Company.FindAsync(request.data.companyId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            //UPDATE SQL SERVER
            string uniqueKey = request.data.companyCode ?? "null";
            uniqueKey = $"{uniqueKey}{request.data.companyName.ToLower()}";

            entity.companyCode = request.data.companyCode;
            entity.companyName = request.data.companyName;
            entity.suspendFlag = request.data.suspendFlag;
            entity.sapIntegrated = request.data.sapIntegrated;
            entity.status = (int)EventStatus.COMPLETED;
            entity.uniqueKey = uniqueKey;
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
                UpdateCompanyCQRSRequest cqrsRequest = new();
                cqrsRequest.companyId = request.data.companyId;
                cqrsRequest.companyCode = request.data.companyCode;
                cqrsRequest.companyName = request.data.companyName;

                ServiceBusRequest<UpdateCompanyCQRSRequest> sbusUserRequest = new()
                {
                    data = cqrsRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_COMPANY_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_UPDATE_COMPANY
                };

                List<string> jsonUserRequest = new() { sbusUserRequest.Serialize() };

                jsonUserRequest = new() { sbusUserRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_COMPANY_USER_SUBS_FILTER_NAME,
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