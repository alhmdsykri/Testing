namespace Sera.Application.Usecase
{
    public class UpdateBusinessUnitHandler : BaseHandler,
        IRequestHandler<UpdateBusinessUnitRequest, Response>
    {
        public UpdateBusinessUnitHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                    ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            UpdateBusinessUnitRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            // Validate Existing Business Unit Id
            var businessUnitId = await dbContext.BusinessUnit.FindAsync(request.businessUnitId);

            if (businessUnitId == null)
            {
                return response.Fail(TransactionId, Message.NotExist("Business Unit Id"));
            }

            // Validate Existing Business Unit Code
            if (!string.IsNullOrWhiteSpace(request.businessUnitCode))
            {
                var isExists = await dbContext.BusinessUnit
                                              .AsNoTracking()
                                              .AnyAsync(x => x.businessUnitId != request.businessUnitId &&
                                                             x.businessUnitCode == request.businessUnitCode.Trim(),
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Business Unit", request.businessUnitCode.Trim()));
                }
            }

            // Validate Existing Company Id
            var companyId = await dbContext.Company.FindAsync(request.companyId);

            if (companyId == null)
            {
                return response.Fail(TransactionId, Message.NotExist("Company Id"));
            }

            //BUILD COMPANY COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "Business Unit",
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
            ServiceBusRequest<UpdateBusinessUnitRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_BUSINESSUNIT,
                data = request,
                entity = "Business Unit",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                status = (int)EventStatus.INPROGRESS,
                username = UserId
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.ORGANIZATION_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Business Unit"));
        }
    }
}
