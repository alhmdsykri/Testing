namespace Sera.Application.Usecase
{
    public class CreateCustomerContactHandler : BaseHandler, IRequestHandler<CreateCustomerContactRequest, Response>
    {
        public CreateCustomerContactHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(CreateCustomerContactRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            List<SQL.CustomerFunction> listData = new();
            char[] delimiterChars = { ';', ',', '\t' };

            string[] functionName = request.functionName.Split(delimiterChars);

            if (request.isPIC)
            {
                if (functionName.Length < 3)
                {
                    return response.Fail(TransactionId, "if the card is set as the main PIC, please choose all function");
                }
            }

            //VALIDATE CONTACT NAME EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.contactName))
            {
                var isExists = await dbContext.CustomerContact
                                              .AsNoTracking()
                                              .AnyAsync(x => x.contactName == request.contactName.Trim() &&
                                                             x.customerId == request.customerId &&
                                                             x.status == (int)EventStatus.COMPLETED,
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Contact Name"));
                }
            }

            #region SEND MESSAGE EVENT HISTORY STATUS 1
            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY CUSTOMER CONTACT
            EventHistory collectionCustomerContact = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = "Customer Contact",
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collectionCustomerContact);

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY CUSTOMER FUNCTION
            EventHistory collectionCustomerFunction = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = "Customer Function",
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collectionCustomerFunction);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS MSSQL
          
            ////SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<CreateCustomerContactRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_CUSTOMER_CONTACT,
                data = request,
                entity = "Customer Contact",
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

            return response.Success(TransactionId, Message.Accepted("Customer Contact"));
            #endregion

        }
    }
}