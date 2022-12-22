namespace Sera.Application.Persistor
{
    public class DeleteProductHandler : BaseHandler,
                                         IRequestHandler<DeleteProductRequest, IResultStatus>
    {
        public DeleteProductHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(DeleteProductRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //RETRIEVE SQL SERVER
            var entity = dbContext.Product
                                  .Where(x => x.productId == request.data.productId &&
                                              x.status == (int)EventStatus.COMPLETED)
                                  .FirstOrDefault();

            if (entity == null)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            //UPDATE SQL SERVER
            entity.status = (int)EventStatus.DELETED;
            entity.deletedAt = DateTime.Now.AddDays(AppConst.MAX_DAY_TEMP_DELETE);
            entity.modifiedBy = request.username;
            entity.modifiedAt = DateTime.UtcNow;

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
                status = (int)EventStatus.DELETED,
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
