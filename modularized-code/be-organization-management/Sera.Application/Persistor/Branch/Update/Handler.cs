namespace Sera.Application.Persistor
{
    public class UpdateBranchHandler : BaseHandler,
                                       IRequestHandler<UpdateBranchRequest, IResultStatus>
    {
        public UpdateBranchHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateBranchRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region CHECK IF EXISTS
            SQL.Branch entity = await dbContext.Branch.FindAsync(request.data.branchId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            //INSERT INTO SQL SERVER
            string uniqueKey = request.data.branchCode ?? "null";
            uniqueKey = $"{uniqueKey}{request.data.branchName.ToLower()}";

            entity.branchCode = request.data.branchCode;
            entity.branchName = request.data.branchName;
            entity.businessUnitId = request.data.businessUnitId;
            entity.regionId = request.data.regionId;
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

            if (request.data.isNameUpdated)
            {
                UpdateBranchCQRSRequest cqrsRequest = new();
                cqrsRequest.branchId = request.data.branchId;
                cqrsRequest.branchCode = request.data.branchCode;
                cqrsRequest.branchName = request.data.branchName;

                ServiceBusRequest<UpdateBranchCQRSRequest> sbusCQRSRequest = new()
                {
                    data = cqrsRequest,
                    entity = request.entity,
                    feURL = request.feURL,
                    method = request.method,
                    source = request.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.username,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_BRANCH_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_UPDATE_BRANCH_USER
                };

                #region SEND MESSAGE TO SERVICE BUS USER
                List<string> jsonCQRSRequest = new() { sbusCQRSRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_BRANCH_USER_SUBS_FILTER_NAME,
                                               jsonCQRSRequest);
                #endregion

                #region SEND MESSAGE TO SERVICE BUS ROUTE
                sbusCQRSRequest.filter = AppConst.SERVICE_BUS_CQRS_BRANCH_ROUTE_SUBS_DLQ_FILTER_NAME;
                sbusCQRSRequest.action = AppConst.FA_ACTION_CQRS_UPDATE_BRANCH_ROUTE;

                jsonCQRSRequest = new() { sbusCQRSRequest.Serialize() };

                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_BRANCH_ROUTE_SUBS_FILTER_NAME,
                                               jsonCQRSRequest);
                #endregion
            }

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.ORGANIZATION_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}