namespace Sera.Application.Usecase
{
    public class DeleteLocationHandler : BaseHandler, IRequestHandler<DeleteLocationRequest, Response>
    {
        public DeleteLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                     ICosmosContext eventContext, IMessage message, IRESTMasterClient masterClient)
            : base(httpContext, dbContext, eventContext, message, masterClient)
        { }

        public async Task<Response> Handle(DeleteLocationRequest request, CancellationToken cancellationToken)
        {
            Response response = new();

            #region PAYLOAD SERVICE BUS

            ServiceBusRequest<string> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_DELETE_LOCATION,
                data = request.Serialize(),
                entity = AppConst.LOCATION,
                feURL = ClientURL,
                method = EventMethod.DELETE.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            #endregion

            #region CHECK VALIDATION LOCATION USED OR NOT

            var validResponse = await masterClient.GetLocationUsedAsync(TransactionId, UserId, request.locationId);

            if (validResponse.Data.isValid == true)
            {
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.UsedValidation(AppConst.LOCATION);

                List<string> jsonRequestUsed = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestUsed);

                return response.Fail(TransactionId, Message.UsedValidation(AppConst.LOCATION));
            }

            #endregion

            #region CHECK DATA LOCATION EXISTS OR NOT

            var domain =  dbContext.Location
                                        .Where(x =>  x.locationId == request.locationId &&
                                                     x.status == (int)EventStatus.COMPLETED)
                                        .FirstOrDefault();
            if (domain == null)
            {
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.NotFound(Message.NotFound(AppConst.LOCATION));

                List<string> jsonRequestExists = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestExists);

                return response.Fail(TransactionId, Message.NotFound(AppConst.LOCATION));
            }

            #endregion

            #region CHECK DATA LOCATION FROM VM OR NOT

            if (!string.IsNullOrWhiteSpace(domain.source) && domain.source.Equals(DataSource.VM.ToString()))
            {
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = Message.VMValidation("Location Code");

                List<string> jsonRequestVM = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestVM);

                return response.Fail(TransactionId, Message.VMValidation(AppConst.LOCATION));
            }

            #endregion

            #region SEND DATA TO COSMOSDB

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.DELETE.ToString(),
                entity = AppConst.LOCATION,
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            #endregion

            #region SEND DATA TO MSSQL

            //SEND ENTITY TO SERVICE BUS MSSQL
            ServiceBusRequest<DeleteLocationRequest> sbusRequestMSSQL = new()
            {
                action = AppConst.FA_ACTION_DELETE_LOCATION,
                data = request,
                entity = AppConst.LOCATION,
                feURL = ClientURL,
                method = EventMethod.DELETE.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
            };

            List<string> jsonRequestMSSQL = new() { sbusRequestMSSQL.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequestMSSQL);
            #endregion

            return response.Success(TransactionId, Message.Accepted(AppConst.LOCATION));
        }
    }
}