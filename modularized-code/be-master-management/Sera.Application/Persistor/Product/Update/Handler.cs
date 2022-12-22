namespace Sera.Application.Persistor
{
    public class UpdateProductHandler : BaseHandler,
                                               IRequestHandler<UpdateProductRequest, IResultStatus>
    {
        public UpdateProductHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(UpdateProductRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //UPDATE PRODUCT
            SQL.Product entity = await dbContext.Product.FindAsync(request.data.productId);

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            string uniqueKey = $"{entity.businessUnitId}{request.data.productName.ToLower()}";

            entity.productStatus = request.data.productStatus;
            entity.productName = request.data.productName;
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
            entity.modifiedAt = DateTime.UtcNow;
            entity.modifiedBy = request.username;
            entity.uniqueKey = uniqueKey;
            entity.status = (int)EventStatus.COMPLETED;

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
