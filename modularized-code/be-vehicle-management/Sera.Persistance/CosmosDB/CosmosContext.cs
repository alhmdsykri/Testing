namespace Sera.Persistance.CosmosDB
{
    public class CosmosContext : ICosmosContext
    {
        private readonly IMongoCollection<EventHistory> eventHistory;

        public CosmosContext(CosmosDB mongo)
        {
            var db = mongo.GetClient().GetDatabase(AppConst.COSMOS_VEHICLE_DB_NAME);
            eventHistory = db.GetCollection<EventHistory>(CommonConst.COSMOS_EVENT_COLLECTION_NAME);
        }

        public async Task CreateAsync(EventHistory entity)
        {
            await eventHistory.InsertOneAsync(entity);
        }
    }
}