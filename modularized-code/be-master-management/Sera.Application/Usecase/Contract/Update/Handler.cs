namespace Sera.Application.Usecase
{
    public class UpdateContractHandler : BaseHandler,
                 IRequestHandler<UpdateContractRequest, Response>
    {
        public UpdateContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                           ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateContractRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

 
            // Validate Contract Id Existing
            var isExists = await dbContext.CustomerContract
                                          .AsNoTracking()
                                          .AnyAsync(x => x.customerContractId == request.contractId &&
                                                         x.customerContractStatus != (int)ContractStatus.EXPIRED &&
                                                         x.status == (int)EventStatus.COMPLETED,
                                                         cancellationToken: cancellationToken);
            if (!isExists)
            {
                return response.Fail(TransactionId, Message.NotExist("Contract Id"));
            }

            // get StartDate and EndDate customerContract
            var customerContract = dbContext.CustomerContract
                                                  .AsNoTracking()
                                                  .Where(x => x.customerContractId == request.contractId &&
                                                              x.customerContractStatus != (int)ContractStatus.EXPIRED &&
                                                              x.status == (int)EventStatus.COMPLETED)
                                                  .Select(x => new { x.customerContractStatus, x.startDate }).FirstOrDefault();

            if (customerContract.customerContractStatus == 1)
            {
                if (request.startDate.Date < DateTime.Now.Date)
                {
                    return response.Fail(TransactionId, "start date must be greater than equal today");
                }
            }

            if (customerContract.customerContractStatus == 2 || customerContract.customerContractStatus == 3)
            {
                if (request.startDate.Date != customerContract.startDate)
                {
                    return response.Fail(TransactionId, "Sorry..if contract status active or expiry start date can not updated");
                }

                request.startDate = customerContract.startDate;
            }
           
            #region UPDATE CONTRACT
            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "CustomerContract",
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
            ServiceBusRequest<UpdateContractRequest> sbusRequest = new()    
            {
                action = AppConst.FA_ACTION_UPDATE_CONTRACT,
                data = request,
                entity = "CustomerContract",
                feURL = ClientURL,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                status = (int)EventStatus.INPROGRESS,
                transactionId = TransactionId,
                username = UserId,
                startDate = DateTime.UtcNow.Date, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(1).Date, //[REVISIT]
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);


            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;

            List<string> jsonRequestFirebase = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);

            #endregion

            return response.Success(TransactionId, Message.Accepted("Contract"));
        }
    }
}