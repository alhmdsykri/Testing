namespace Sera.Application.Usecase
{
    public class CreateContractItemtHandler : BaseHandler,
                 IRequestHandler<CreateContractItemRequest, Response>
    {
        public CreateContractItemtHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                          ICosmosContext eventContext, IMessage message)
               : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(CreateContractItemRequest request, CancellationToken cancellationToken)
        {
            Response response = new();
            int total = request.contractItem.Count();

            //VALIDATE CONTRACT ID IN CUSTOMER CONTRACT
            if (request.contractId > 0)
            {
                if (!await dbContext.CustomerContract
                                    .AnyAsync(x => x.customerContractId == request.contractId &&
                                                   x.status == (int)EventStatus.COMPLETED,
                                                   cancellationToken: cancellationToken))
                {
                    return response.Fail(TransactionId, Message.NotFound("Contract Id"));
                }
            }

            if (request.contractItem.Count() > 10)
            {
                return response.Fail(TransactionId, Message.CanAddContract());
            }

            //VALIDASI MATERIALID, UOM, QUANTITY, NUMBER OF DRIVER, BRANCH ID NOT DUPLICATE
            var query = (from x in request.contractItem
                         let temp = new
                         {
                             x.materialId,
                             x.materialCode,
                             x.UOMCode,
                             x.quantity,
                             x.numberOfDriver,
                             x.branchId
                         }
                         group temp by new { x.materialId,x.materialCode, x.UOMCode, x.quantity, x.numberOfDriver, x.branchId })
                                .Where(g => g.Count() > 1)
                                .ToList();

            if (query.Count > 0)
            {
                foreach (var item in query)
                {
                    return response.Fail(TransactionId, Message.MaterialDuplicate(item.Key.materialCode));
                }
            }
            else
            {
                //VALIDASI IF THERE ALL BRANCH THEN ONLY ONE REQUEST MATERIAL ITEM
                if (request.contractItem.Count() > 1)
                {
                    foreach (var item in request.contractItem)
                    {
                        if (item.branchId == null)
                        {
                            return response.Fail(TransactionId, Message.ALLBranchValidation(item.materialCode));
                        }
                    }
                }
            }

            //VALIDATE MATERIAL ID EXISTENCE
            foreach (var item in request.contractItem)
            {
                var isExistsMaterial = dbContext.Material
                                                .AsNoTracking()
                                                .Where(x => x.materialId == item.materialId &&
                                                       x.status == (int)EventStatus.COMPLETED);

                if (isExistsMaterial.Count() == 0)
                {
                    return response.Fail(TransactionId, Message.NotExist($"Material {item.materialCode} "));
                }
            }

            //VALIDATE IF ALL BRANCH DATA IN DATABASE SHOULD BE NOT EXISTS
            foreach (var item in request.contractItem)
            {
                    var isExistsMaterialItemAllBranch = dbContext.CustomerContractItem.AsNoTracking()
                                                                  .Where(y => y.materialId == item.materialId &&
                                                                         y.customerContractId == request.contractId &&
                                                                         y.UOMCode == item.UOMCode &&
                                                                         y.quantity == item.quantity &&
                                                                         y.numberOfDriver == item.numberOfDriver &&
                                                                         y.branchId == null && //ALL BRANCH
                                                                         y.status == (int)EventStatus.COMPLETED);

                    if (isExistsMaterialItemAllBranch.Count() > 0)
                    {
                        return response.Fail(TransactionId, Message.MaterialDuplicateInDB(item.materialCode));
                    }
            }

            //VALIDATE CONTRACT ITEM IS EXISTENCE 
            foreach (var item in request.contractItem)
            {
                var isExistsMaterialItem = dbContext.CustomerContractItem
                                           .AsNoTracking()
                                           .Where(y => y.materialId == item.materialId &&
                                                       y.customerContractId == request.contractId &&
                                                       y.UOMCode == item.UOMCode &&
                                                       y.quantity == item.quantity &&
                                                       y.numberOfDriver == item.numberOfDriver &&
                                                       y.status == (int)EventStatus.COMPLETED);
                if (item.branchId != null)
                {
                    isExistsMaterialItem = isExistsMaterialItem.AsNoTracking().Where(y => y.branchId == item.branchId);
                }
  
                if (isExistsMaterialItem.Count() > 0)
                {
                    return response.Fail(TransactionId, Message.MaterialDuplicateInDB(item.materialCode));
                }
            };

            //BUILD CONTRACT ITEM COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = AppConst.CUSTOMER_CONTRACT_ITEM,
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            //SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<CreateContractItemRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_CONTRACT_ITEM,
                data = request,
                entity = AppConst.CUSTOMER_CONTRACT_ITEM,
                feURL = ClientURL,
                method = HTTPMethod.POST.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("ContractItem"));
        }
    }
}
