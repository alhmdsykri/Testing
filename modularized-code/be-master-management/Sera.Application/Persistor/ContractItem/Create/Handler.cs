namespace Sera.Application.Persistor
{
    public class CreateContractItemHandler : BaseHandler,
                                               IRequestHandler<CreateContractItemRequest, IResultStatus>
    {
        public CreateContractItemHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateContractItemRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();
            int iLineItemNo = 0;

            //INSERT INTO SQL SERVER
            List<SQL.CustomerContractItem> listData = new();

            var CustomerContract = dbContext.CustomerContract
                                            .AsNoTracking()
                                            .Where(x => x.customerContractId == request.data.contractId &&
                                                        x.status == (int)EventStatus.COMPLETED);

            var startDate = CustomerContract.Select(x => x.startDate).FirstOrDefault();
            var endDate = CustomerContract.Select(x => x.endDate).FirstOrDefault();

            var itemNo = dbContext.CustomerContractItem
                                  .AsNoTracking()
                                  .Where(x => x.customerContractId == request.data.contractId &&
                                              x.status == (int)EventStatus.COMPLETED)
                                  .Select(y => new { y.lineItemNumber })
                                  .OrderByDescending(z => z.lineItemNumber).FirstOrDefault();

            if (itemNo != null)
            {
                iLineItemNo += (int)itemNo.lineItemNumber;
            }

            foreach (var item in request.data.contractItem)
            {
                iLineItemNo += 10;

                SQL.CustomerContractItem entity = new();

                entity.customerContractId = request.data.contractId;
                string uniqueKey = $"{request.data.contractId}{item.materialId}{item.branchId}";

                entity.materialId = item.materialId;
                entity.UOMCode = item.UOMCode;
                entity.lineItemNumber = iLineItemNo;
                entity.quantity = (int)item.quantity;
                entity.numberOfDriver = item.numberOfDriver;
                entity.helperIncluded = CommonConst.DEFAULT_HELPER_INCLUDED;
                entity.reportIncluded = CommonConst.DEFAULT_REPORT_INCLUDED;
                entity.UJPIncluded = CommonConst.DEFAULT_UJP_INCLUDED;
                entity.fuel = item.fuel;
                entity.tollAndParking = item.tollAndParking;
                entity.isDedicated = false;
                entity.isActive = true;
                entity.isWithDriver = true;
                entity.startDate = startDate;
                entity.endDate = endDate;
                entity.status = (int)EventStatus.COMPLETED;
                entity.uniqueKey = uniqueKey;
                entity.version = AppConst.DATA_VERSION;
                entity.createdBy = request.username;
                entity.createdAt = DateTime.UtcNow;
                entity.modifiedBy = request.username;
                entity.modifiedAt = DateTime.UtcNow;
                entity.transactionId = request.transactionId;

                if (item.branchId != null)
                {
                    entity.branchId = item.branchId;
                    entity.branchCode = item.branchCode;
                    entity.branchName = item.branchName;
                    entity.isNational = false;
                }
                else
                {
                    entity.isNational = true;
                }

                listData.Add(entity);
            }

            await dbContext.CustomerContractItem.AddRangeAsync(listData, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.contractId = request.data.contractId;

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
