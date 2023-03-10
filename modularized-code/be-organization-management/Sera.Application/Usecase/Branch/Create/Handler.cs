namespace Sera.Application.Usecase
{
    public class CreateBranchHandler : BaseHandler,
        IRequestHandler<CreateBranchRequest, Response>
    {
        public CreateBranchHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                   ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(
            CreateBranchRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            Thread.Sleep(5000);

            #region CHECK BRANCH CODE AVAILABILITY
            if (!string.IsNullOrWhiteSpace(request.branchCode))
            {
                var isExists = await dbContext.Branch
                                              .AsNoTracking()
                                              .AnyAsync(x => x.branchCode == request.branchCode.Trim(),
                                                        cancellationToken: cancellationToken);

                if (isExists)
                {
                    return response.Fail(TransactionId, Message.Exist("Branch"));
                }
            }
            #endregion

            #region CHECK BUSINESS UNIT EXISTANCE
            var businessUnit = await dbContext.BusinessUnit
                                              .FindAsync(request.businessUnitId);

            if (businessUnit == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Business unit"));
            }
            #endregion

            #region CHECK REGION EXISTANCE
            var region = await dbContext.Region.FindAsync(request.regionId);

            if (region == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Region"));
            }
            #endregion

            //BUILD BRANCH COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.POST.ToString(),
                entity = "Branch",
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
            ServiceBusRequest<CreateBranchRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_CREATE_BRANCH,
                data = request,
                entity = "Branch",
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

            return response.Success(TransactionId, Message.Accepted("branch"));
        }
    }
}
