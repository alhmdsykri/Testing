namespace Sera.Application.Persistor
{
    public class CreateCosmosHandler : BaseHandler,
                                       IRequestHandler<CreateCosmosRequest, IResultStatus>
    {
        public CreateCosmosHandler(ICosmosContext cosmosContext) : base(cosmosContext)
        { }

        public async Task<IResultStatus> Handle(CreateCosmosRequest request,
                                                CancellationToken cancellationToken)
        {
            IResultStatus result = new ResultStatus();

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory entity = new();
            entity._id = Guid.NewGuid().ToString();
            entity.transactionId = request.transactionId;
            entity.method = request.method;
            entity.source = request.source;
            entity.payload = request.data;
            entity.status = request.status;
            entity.entity = request.entity; 
            entity.userId = request.username;
            entity.datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd");
            entity.date = DateTime.UtcNow;

            //INSERT INTO COSMOS DB
            await cosmosContext.CreateAsync(entity);

            return result.ReturnSuccessStatus();
        }
    }
}