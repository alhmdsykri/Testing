namespace Sera.Application.Persistor
{
    /// <summary>
    /// Insert into SQL Server
    /// Send message to service bus Comos DB
    /// Send message to service bus firebase
    /// </summary>
    public class CreateBranchHandler : BaseHandler,
                                       IRequestHandler<CreateBranchRequest, IResultStatus>
    {
        public CreateBranchHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateBranchRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //INSERT INTO SQL SERVER
            string uniqueKey = request.data.branchCode ?? "null";
            uniqueKey = $"{uniqueKey}{request.data.branchName.ToLower()}";

            SQL.Branch entity = request.data.Adapt<SQL.Branch>();
            entity.status = (int)EventStatus.COMPLETED;
            entity.uniqueKey = uniqueKey;
            entity.createdBy = request.username;
            entity.createdAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.version = AppConst.DATA_VERSION;

            await dbContext.Branch.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.branchId = entity.branchId;

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
            await message.SendMessageAsync(AppConst.ORGANIZATION_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
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