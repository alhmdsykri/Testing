using MongoDB.Driver;

namespace Sera.Persistance.CosmosDB
{
    public class CosmosDB
    {
        private static MongoClient client;
        public CosmosDB(string connString)
        {
            client = new MongoClient(connString);
        }
        public MongoClient GetClient()
        {
            return client;
        }
    }
}
