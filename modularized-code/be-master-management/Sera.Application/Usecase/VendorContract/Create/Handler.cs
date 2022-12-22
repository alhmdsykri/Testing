namespace Sera.Application.Usecase
{
    public class CreateVendorContractHandler : BaseHandler,IRequestHandler<CreateVendorContractRequest, Response>
    {
        public CreateVendorContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                           ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            CreateVendorContractRequest request, CancellationToken cancellationToken)
        {
            Response response = new();
            int total = request.contract.Count();

            // Validate Vendor Id
            if (request.vendorId > 0)
            {
                if (!await dbContext.Vendor.AnyAsync(x => x.vendorId == request.vendorId,
                                                     cancellationToken: cancellationToken))
                {
                    return response.Fail(TransactionId, Message.NotFound("Vendor Id"));
                }
            }

            if (request.contract.Count() > 10)
            {
                return response.Fail(TransactionId, "Cannot Add More Than 10 Contract");
            }

            //VALIDATE VENDOR CONTRACT NUMBER EXISTENCE
            var query = request.contract.GroupBy(x => x.contractNumber)
                                        .Where(g => g.Count() > 1)
                                        .Select(y => y.Key)
                                        .ToList();
            if (query.Count >= 1)
            {
                foreach (var item in query)
                {
                    return response.Fail(TransactionId, $"Contract Number {item} is duplicated");
                }
            }

            var contractNumber = request.contract.Select(x => x.contractNumber).ToList();

            var isExists = dbContext.VendorContract
                                    .AsNoTracking()
                                    .Where(x => contractNumber.Contains(x.vendorContractNumber))
                                    .Select(s => s.vendorContractNumber);

            foreach (var item in isExists)
            {
                return response.Fail(TransactionId, Message.Exist($"Vendor Contract with contract number {item}"));
            }

            //BUILD VENDOR CONTRACT COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = "Vendor Contract",
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
            ServiceBusRequest<CreateVendorContractRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_VENDOR_CONTRACT,
                data = request,
                entity = "Vendor Contract",
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

            return response.Success(TransactionId, Message.Accepted("Vendor Contract"));
        }
    }
}
