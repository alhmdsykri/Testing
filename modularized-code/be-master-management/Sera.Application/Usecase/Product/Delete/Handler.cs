﻿namespace Sera.Application.Usecase
{
    public class DeleteProductHandler : BaseHandler, IRequestHandler<DeleteProductRequest, Response>
    {
        public DeleteProductHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(DeleteProductRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            //VALIDATE PRODUCT ID EXISTING
            var domain = dbContext.Product.Where(x => x.productId == request.productId &&
                                                      x.status == (int)EventStatus.COMPLETED)
                                          .FirstOrDefault();

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Product"));
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.DELETE.ToString(),
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
            ServiceBusRequest<DeleteProductRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_DELETE_PRODUCT,
                data = request,
                entity = "Product",
                feURL = ClientURL,
                method = HTTPMethod.DELETE.ToString(),
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
