namespace Sera.Application.Persistor
{
    public class UpdateContractItemHandler : BaseHandler,
                                               IRequestHandler<UpdateContractItemRequest, IResultStatus>
    {
        public UpdateContractItemHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateContractItemRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region UPDATE CONTRACT ITEM

            var entityContractItems = await dbContext.CustomerContractItem
                                                     .Where(x => x.customerContractId == request.data.contractId &&
                                                                 x.status == (int)EventStatus.COMPLETED)
                                                     .ToListAsync();

            if (entityContractItems.Count > 0)
            {
                entityContractItems.ForEach(x =>
                {
                    x.startDate = request.data.startDate;
                    x.endDate = request.data.endDate;
                    x.modifiedBy = request.username;
                    x.modifiedAt = DateTime.UtcNow;
                    x.status = (int)EventStatus.COMPLETED;
                    x.transactionId = request.transactionId;
                });

                if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
                {
                    return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
                }
            }

            #endregion

            //#region SEND MESSAGE TO SERVICE BUS CUSTOMER CONTRACT ITEM PERSISTOR 
            UpdateContractItemModel DataUpdateContractItem = new()
            {
                contractId = request.data.contractId,
                startDate = request.data.startDate,
                endDate = request.data.endDate,
                contractStatus = request.data.contractStatus
            };

            ServiceBusRequest<UpdateContractItemModel> sbusRequestContractItem = new()
            {
                action = AppConst.FA_ACTION_CONTRACT_STATUS_UPDATER,
                data = DataUpdateContractItem,
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

            List<string> jsonRequest = new() { sbusRequestContractItem.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}