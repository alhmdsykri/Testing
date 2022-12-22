namespace Sera.Application.Persistor
{
    public class UpdateContractHandler : BaseHandler,
                                         IRequestHandler<UpdateContractRequest, IResultStatus>
    {
        public UpdateContractHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateContractRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            int customerStatus = 0;

            #region NOT STARTED
            if (request.data.startDate.Date > DateTime.Now.Date) //Not Started
            {
                customerStatus = (int)ContractStatus.NOT_STARTED;
            }
            #endregion

            #region ACTIVE
            if ((request.data.endDate.Date - DateTime.Now.Date).Days > CommonConst.MAX_EXP && request.data.startDate.Date <= DateTime.Now.Date) //Active
            {
                customerStatus = (int)ContractStatus.ACTIVE;
            }
            #endregion

            #region EXPIRING IN
            if ((request.data.endDate.Date - DateTime.Now.Date).Days > 0 && (request.data.endDate.Date - DateTime.Now.Date).Days <= CommonConst.MAX_EXP) //Expiring SOON
            {
                customerStatus = (int)ContractStatus.EXPIRING_SOON;
            }
            #endregion

            #region EXPIRED
            if (DateTime.Now.Date >= request.data.endDate.Date) //Expired
            {
                customerStatus = (int)ContractStatus.EXPIRED;
            }
            #endregion

            //UPDATE CONTRACT

            SQL.CustomerContract entity = await dbContext.CustomerContract.FindAsync(request.data.contractId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.startDate = request.data.startDate.Date;
            entity.endDate = request.data.endDate.Date;
            entity.customerContractStatus = customerStatus;
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.status = (int)EventStatus.INPROGRESS;
            entity.transactionId = request.transactionId;

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.contractStatus = customerStatus;

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "CustomerContractItem",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS CUSTOMER CONTRACT ITEM PERSISTOR 
            UpdateContractModel DataUpdateContract = new()
            {
                contractId = request.data.contractId,
                startDate = request.data.startDate,
                endDate = request.data.endDate,
                contractStatus = request.data.contractStatus,
            };

            //SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<UpdateContractModel> sbusRequestContract = new()
            {
                action = AppConst.FA_ACTION_UPDATE_CONTRACT_ITEM,
                data = DataUpdateContract,
                entity = "CustomerContractItem",
                feURL = request.feURL,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                method = HTTPMethod.PUT.ToString(),
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                transactionId = request.transactionId,
                username = request.username,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE), //[REVISIT]
            };

            jsonRequest = new() { sbusRequestContract.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}

