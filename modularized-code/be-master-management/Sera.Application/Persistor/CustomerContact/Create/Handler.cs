namespace Sera.Application.Persistor
{
    public class CreateCustomerContactHandler : BaseHandler,
                                               IRequestHandler<CreateCustomerContactRequest, IResultStatus>
    {
        public CreateCustomerContactHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateCustomerContactRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //GENERATE CONTACT CODE FOR FMS
            int seqContactCode = await dbContext.GenerateCode(AppConst.SEQUENCE_CUSTOMER_CONTACT);

            if (seqContactCode == -1)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            string ContactCodeSeq = "F" + string.Format("{0:00000}", seqContactCode);

            //INSERT INTO SQL SERVER
            SQL.CustomerContact entity = new();

            entity.customerId = request.data.customerId;
            entity.customerContactCode = ContactCodeSeq;
            entity.contactName = request.data.contactName;
            entity.phoneNumber = request.data.phoneNumber;
            entity.email = request.data.email;
            entity.position = request.data.position;
            entity.department = request.data.departement;
            entity.remarks = request.data.remarks;
            entity.isPIC = request.data.isPIC;
            entity.status = (int)EventStatus.COMPLETED;
            entity.createdAt = DateTime.UtcNow;
            entity.createdBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.version = AppConst.DATA_VERSION;

            await dbContext.CustomerContact.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            request.data.customerContactId = entity.customerContactId;

            #region SEND MESSAGE TO SERVICE BUS TO CREATE FIREBASE  STATUS 1
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = "Customer Contact",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                status = (int)EventStatus.INPROGRESS,
                username = request.username,
                transactionId = request.transactionId,
            };

            List<string> jsonRequestFirebase = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);
            #endregion

            #region SEND MESSAGE TO SERVICE BUS EVENT HISTORY
            sbusRequest.entity = "Customer Function";
            sbusRequest.status = (int)EventStatus.COMPLETED;

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            CreateCustomerFunctionModel DataCustomerFunction = new()
            {
                customerContactId = request.data.customerContactId,
                functionName = request.data.functionName
            };

            #region  SEND MESSAGE TO SERVICE BUS MSSQL CUSTOMER FUNCTION
            ServiceBusRequest<CreateCustomerFunctionModel> sbusRequestCustomerFunction = new()
              {
                action = AppConst.FA_ACTION_CREATE_CUSTOMER_FUNCTION,
                data = DataCustomerFunction,
                entity = "Customer Function",
                feURL = request.feURL,
                method = request.method,
                source = request.source,
                transactionId = request.transactionId,
                username = request.username,
                filter = CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                status = (int)EventStatus.COMPLETED,
                startDate = DateTime.UtcNow, //[REVISIT]
                endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE), //[REVISIT]
           };

            List<string> jsonRequestCustomerFunction = new() { sbusRequestCustomerFunction.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequestCustomerFunction);

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");

            #endregion
        }
    }
}
