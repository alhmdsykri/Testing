namespace Sera.Application.Persistor
{
    public class ContractStatusUpdateHandler : BaseHandler,
                                               IRequestHandler<ContractStatusUpdateRequest, IResultStatus>
    {
        public ContractStatusUpdateHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(ContractStatusUpdateRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //UPDATE CONTRACT STATUS
            var entity = await dbContext.CustomerContract.FindAsync(request.data.contractId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

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
                entity = "CustomerContractItem",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
                startDate = DateTime.UtcNow.Date, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE).Date, //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            sbusRequest.entity = "CustomerContract";
            jsonRequest.Add(sbusRequest.Serialize());
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO FIREBASE SERVICE BUS
            List<string> jsonRequestFirebase = new() { sbusRequest.Serialize() };
            sbusRequest.entity = "CustomerContract";
            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
            jsonRequestFirebase.Add(sbusRequest.Serialize());
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}