

namespace Sera.Application.Usecase
{
    public class CreateProductHandler : BaseHandler, IRequestHandler<CreateProductRequest, Response>
    {
        public CreateProductHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(CreateProductRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            //VALIDATE PRODUCT NAME EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.productName))
            {
                var isExists = await dbContext.Product
                                              .AsNoTracking()
                                              .AnyAsync(x => x.productName == request.productName.Trim(),
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Product Name"));
                }
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = "Product",
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
            ServiceBusRequest<CreateProductRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_PRODUCT,
                data = request,
                entity = "Product",
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

            return response.Success(TransactionId, Message.Accepted("Product"));
        }
    }
}