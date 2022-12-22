namespace Sera.Application.Usecase
{
    public class UpdateProductHandler : BaseHandler, IRequestHandler<UpdateProductRequest, Response>
    {
        public UpdateProductHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateProductRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

            // Validate Product Id Existing
            if (request.productId > 0)
            {
                var domain = dbContext.Product
                                      .Where(x => x.productId == request.productId &&
                                                  x.status == (int)EventStatus.COMPLETED)
                                      .FirstOrDefault();

                if (domain == null)
                {
                    return response.Fail(TransactionId, Message.NotFound("Product Id"));
                }
            }

            // Validate Product Name Existing
            var isExists = await dbContext.Product
                                          .AsNoTracking()
                                          .AnyAsync(x => x.productName == request.productName.Trim() &&
                                                         x.productId != request.productId,
                                                    cancellationToken: cancellationToken);

            if (isExists)
            {
                return response.Fail(TransactionId, Message.Exist("Product Name"));
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
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
            ServiceBusRequest<UpdateProductRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_PRODUCT,
                data = request,
                entity = "Product",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
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
