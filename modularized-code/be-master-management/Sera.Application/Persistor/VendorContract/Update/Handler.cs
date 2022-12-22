namespace Sera.Application.Persistor
{
    public class UpdateVendorContractHandler : BaseHandler,
                                               IRequestHandler<UpdateVendorContractRequest, IResultStatus>
    {
        public UpdateVendorContractHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateVendorContractRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            int contractStatus = 0;

            #region NOT STARTED
            if (request.data.startDate.Date > DateTime.Now.Date) //Not Started
            {
                contractStatus = (int)ContractStatus.NOT_STARTED;
            }
            #endregion

            #region ACTIVE
            if ((request.data.endDate.Date - DateTime.Now.Date).Days > CommonConst.MAX_EXP && request.data.startDate.Date <= DateTime.Now.Date) //Active
            {
                contractStatus = (int)ContractStatus.ACTIVE;
            }
            #endregion

            #region EXPIRING IN
            if ((request.data.endDate.Date - DateTime.Now.Date).Days > 0 && (request.data.endDate.Date - DateTime.Now.Date).Days <= CommonConst.MAX_EXP) //Expiring SOON
            {
                contractStatus = (int)ContractStatus.EXPIRING_SOON;
            }
            #endregion

            #region EXPIRED
            if (DateTime.Now.Date >= request.data.endDate.Date) //Expired
            {
                contractStatus = (int)ContractStatus.EXPIRED;
            }
            #endregion

            //UPDATE VENDOR CONTRACT
            var entity = await dbContext.VendorContract.FindAsync(request.data.vendorContractId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            entity.vendorContractNumber = request.data.contractNumber;
            entity.startDate = request.data.startDate;
            entity.endDate = request.data.endDate;
            entity.vendorContractStatus = contractStatus;
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
