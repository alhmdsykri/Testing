namespace Sera.Application.Persistor
{
    public class CreateVendorContractHandler : BaseHandler,
                                               IRequestHandler<CreateVendorContractRequest, IResultStatus>
    {
        public CreateVendorContractHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateVendorContractRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //INSERT INTO SQL SERVER
            List<SQL.VendorContract> listData = new();

            foreach (var item in request.data.contract)
            {
                SQL.VendorContract entity = new();
                entity.vendorId = request.data.vendorId;
                string uniqueKey = $"{item.contractNumber.ToLower()}{item.contractType}{item.businessUnitCode}";

                entity.vendorContractNumber = item.contractNumber;
                entity.vendorContractType = item.contractType;
                entity.vendorId = request.data.vendorId;
                entity.companyId = item.companyId;
                entity.companyCode = item.companyCode;
                entity.companyName = item.companyName;
                entity.businessUnitId = item.businessUnitId;
                entity.businessUnitCode = item.businessUnitCode;
                entity.businessUnitName = item.businessUnitName;
                entity.startDate = item.startDate;
                entity.endDate = item.endDate;
                entity.vendorContractStatus = (int)ContractStatus.NOT_STARTED;
                entity.status = (int)EventStatus.COMPLETED;
                entity.uniqueKey = uniqueKey;
                entity.version = AppConst.DATA_VERSION;
                entity.createdBy = request.username;
                entity.createdAt = DateTime.UtcNow;
                entity.modifiedBy = request.username;
                entity.modifiedAt = DateTime.UtcNow;

                listData.Add(entity);
            }

            await dbContext.VendorContract.AddRangeAsync(listData, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.vendorId = request.data.vendorId;

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
