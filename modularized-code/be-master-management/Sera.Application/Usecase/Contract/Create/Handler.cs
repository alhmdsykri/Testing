namespace Sera.Application.Usecase
{
    public class CreateContractHandler : BaseHandler,
        IRequestHandler<CreateContractRequest, Response>
    {
        public CreateContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                     ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(CreateContractRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            //VALIDATE EXISTING CUSTOMER ID
            if (request.customerId > 0)
            {
                var customer = await dbContext.Customer
                                              .AsNoTracking()
                                              .AnyAsync(x => x.customerId == request.customerId &&
                                                         x.status == (int)EventStatus.COMPLETED,
                                                         cancellationToken: cancellationToken);
                if (!customer) //if not exists
                {
                    return response.Fail(TransactionId, Message.NotFound("Customer Id"));
                }
            }

            //BUILD CONTRACT COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = "Contract",
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            #region SEND TO SERVICE BUS
            ServiceBusRequest<CreateContractRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_CONTRACT,
                data = request,
                entity = "Contract",
                feURL = ClientURL,
                method = HTTPMethod.POST.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
                status = (int)EventStatus.INPROGRESS
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return response.Success(TransactionId, Message.Accepted("Contract"));
        }
    }
}
