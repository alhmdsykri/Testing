namespace Sera.Application.Persistor
{
    public class CreateProductHandler : BaseHandler,
                                        IRequestHandler<CreateProductRequest, IResultStatus>
    {
        public CreateProductHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateProductRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //INSERT INTO SQL SERVER
            string uniqueKey = $"{request.data.businessUnitId.ToString()}{request.data.productName.ToLower()}";

            SQL.Product entity = new();
            entity.productStatus = (int)ProductStatus.ACTIVE;
            entity.productName = request.data.productName;
            entity.businessUnitId = request.data.businessUnitId;
            entity.businessUnitCode = request.data.businessUnitCode;
            entity.businessUnitName = request.data.businessUnitName;
            entity.productTypeId = request.data.productTypeId;
            entity.journeyTypeId = request.data.journeyTypeId;
            entity.isExpedition = request.data.isExpedition;
            entity.expeditionId = request.data.expeditionId;
            entity.isAssignedToVehicle = request.data.isAssignedToVehicle;
            entity.isAssignedToDriver = request.data.isAssignedToDriver;
            entity.driverExpensePreTripId = request.data.driverExpensePreTripId;
            entity.driverExpensePostTripId = request.data.driverExpensePostTripId;
            entity.isReconcilation = request.data.isReconcilation;
            entity.hasProofOfDelivery = request.data.hasProofOfDelivery;
            entity.status = (int)EventStatus.COMPLETED;
            entity.createdAt = DateTime.UtcNow;
            entity.createdBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.version = AppConst.DATA_VERSION;
            entity.uniqueKey = uniqueKey;

            await dbContext.Product.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = request.data.Serialize(),
                entity = request.entity,
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

            #region SEND MESSAGE TO SERVICE BUS FIREBASE
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequest);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}