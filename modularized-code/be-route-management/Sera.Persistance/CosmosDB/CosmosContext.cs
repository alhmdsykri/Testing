using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using Microsoft.EntityFrameworkCore;

namespace Sera.Persistance.CosmosDB
{
    public class CosmosContext : ICosmosContext
    {
        private Container _container;
        private readonly IMongoCollection<EventHistory> eventHistory;
        DbSet<Entity.Cosmos.EventHistory> ICosmosContext.EventHistory { get; set; }

        public CosmosContext(CosmosDB mongo)
        {
            var db = mongo.GetClient().GetDatabase(AppConst.COSMOS_ROUTE_DB_NAME);
            eventHistory = db.GetCollection<EventHistory>(CommonConst.COSMOS_EVENT_COLLECTION_NAME);

        }
        
        public async Task CreateAsync(EventHistory entity)
        {
            await eventHistory.InsertOneAsync(entity);
        }

        public async Task<EventHistory?> GetAsync(string transactionId, string entity)
        {
            var result = new EventHistory();
            result = await eventHistory.Find(x => x.transactionId == transactionId && x.entity.ToLower() == entity.ToLower())
                                        .SortByDescending(x => x.date)
                                        .FirstOrDefaultAsync();
            return result;
        }
    }
}
