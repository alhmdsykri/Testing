namespace Sera.Application.Persistor
{
    public class CreateContractHandler : BaseHandler,
                                         IRequestHandler<CreateContractRequest, IResultStatus>
    {
        public CreateContractHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateContractRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //GENERATE CONTRACT NUMBER FOR FMS
            int seqContractNumber = await dbContext.GenerateCode(AppConst.SEQUENCE_CONTRACT);

            if (seqContractNumber == -1)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            string contractNumber = "99" + string.Format("{0:00000000}", seqContractNumber);

            //INSERT INTO SQL SERVER
            string uniqueKey = $"{contractNumber.ToLower()}{request.data.businessUnitName.ToLower()}";

            SQL.CustomerContract entity = new();

            entity.contractNumber = contractNumber.Trim();
            entity.businessUnitId = request.data.businessUnitId;
            entity.businessUnitCode = request.data.businessUnitCode;
            entity.businessUnitName = request.data.businessUnitName;
            entity.customerId = request.data.customerId;
            entity.startDate = request.data.startDate.Date;
            entity.endDate = request.data.endDate.Date;
            entity.customerContractStatus = (int)ContractStatus.NOT_STARTED;
            entity.isProject = false;
            entity.isMonthly = false;
            entity.isTMS = false;
            entity.isOvercharge = false;
            entity.status = (int)EventStatus.COMPLETED;
            entity.uniqueKey = uniqueKey;
            entity.version = AppConst.DATA_VERSION;
            entity.createdBy = request.username;
            entity.createdAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.transactionId = request.transactionId;

            await dbContext.CustomerContract.AddAsync(entity, cancellationToken);

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
