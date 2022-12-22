namespace Sera.Application.Persistor
{
    public class CreateCustomerFuntionHandler : BaseHandler,
                                               IRequestHandler<CreateCustomerFunctionRequest, IResultStatus>
    {
        public CreateCustomerFuntionHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateCustomerFunctionRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            List<SQL.CustomerFunction> listData = new();
            char[] delimiterChars = { ';', ',', '\t' };

            string[] functionName = request.data.functionName.Split(delimiterChars);

            foreach (var st in functionName)
            {
                SQL.CustomerFunction entity = new();

                string uniqueKey = Guid.NewGuid().ToString();
                entity.customerContactId = request.data.customerContactId;
                entity.functionName = st.ToString();
                entity.status = (int)EventStatus.COMPLETED;
                entity.createdAt = DateTime.UtcNow;
                entity.createdBy = request.username;
                entity.modifiedAt = DateTime.UtcNow;
                entity.modifiedBy = request.username;
                entity.version = AppConst.DATA_VERSION;
                entity.uniqueKey = uniqueKey;

                listData.Add(entity);
            }

            await dbContext.CustomerFunction.AddRangeAsync(listData, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Customer Contact",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.COMPLETED,
                username = request.username,
                transactionId = request.transactionId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS FIREBASE STATUS 2
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}
