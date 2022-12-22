namespace Sera.Application.Usecase
{
    public class CreateCompanyHandler : BaseHandler,
        IRequestHandler<CreateCompanyRequest, Response>
    {
        public CreateCompanyHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            CreateCompanyRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            //VALIDATE COMPANY CODE EXISTENCE
            if (!string.IsNullOrWhiteSpace(request.companyCode))
            {
                var isExists = await dbContext.Company
                                              .AsNoTracking()
                                              .AnyAsync(x => x.companyCode == request.companyCode.Trim(),
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Company"));
                }
            }

            //VALIDATE PARENTE COMPANY EXISTENCE
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
                method = HTTPMethod.POST.ToString(),
                entity = "Company",
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            //SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<CreateCompanyRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_COMPANY,
                data = request,
                entity = "Company",
                feURL = ClientURL,
                method = HTTPMethod.POST.ToString(),
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
