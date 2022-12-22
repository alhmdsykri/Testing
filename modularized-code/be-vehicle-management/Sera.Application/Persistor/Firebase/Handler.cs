namespace Sera.Application.Persistor
{
    public class CreateFirebaseHandler : BaseHandler,
                                         IRequestHandler<CreateFirebaseRequest, IResultStatus>
    {
        public CreateFirebaseHandler(IFirebaseContext firebaseContext, IMessage message) :
            base(firebaseContext, message)
        { }

        public async Task<IResultStatus> Handle(CreateFirebaseRequest request,
                                                CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();

            //BUILD LOCATION FIREBASE DB COLLECTION (TABLE) ENTITY
            Notification entity = new();
            entity.transactionId = request.transactionId;
            entity.entity = request.entity;
            entity.feURL = request.feURL;
            entity.payload = request.data;
            entity.status = request.status;
            entity.createdAt = DateTime.UtcNow;

            //INSERT INTO FIREBASE DB
            await firebaseContext.CreateAsync(entity, request.username);

            return result.ReturnSuccessStatus();
        }
    }
}