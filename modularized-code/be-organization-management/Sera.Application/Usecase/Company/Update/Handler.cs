namespace Sera.Application.Usecase
{
    public class UpdateCompanyHandler : BaseHandler,
        IRequestHandler<UpdateCompanyRequest, Response>
    {
        public UpdateCompanyHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            UpdateCompanyRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            var domain = await dbContext.Company.FindAsync(request.companyId);
            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Company"));
            }

            if (!string.IsNullOrWhiteSpace(request.companyCode))
            {
                var isExists = await dbContext.Company
                                              .AsNoTracking()
                                              .AnyAsync(x => x.companyId != request.companyId &&
                                                             x.companyCode == request.companyCode.Trim(),
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Company", request.companyCode.Trim()));
                }
            }

            short? parentCompanyId = request.parentCompanyId.HasValue &&
                                     request.parentCompanyId.Value > 0 ?
                                     request.parentCompanyId : null;

            if (parentCompanyId.HasValue)
            {
                var parent = await dbContext.Company.FindAsync(parentCompanyId);
                if (parent == null)
                {
                    return response.Fail(TransactionId, Message.NotFound("Parent company"));
                }
            }

            //BUILD COMPANY COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "Company",
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
            ServiceBusRequest<UpdateCompanyRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_COMPANY,
                data = request,
                entity = "Company",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ORGANIZATION_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("company"));
        }
    }
}
