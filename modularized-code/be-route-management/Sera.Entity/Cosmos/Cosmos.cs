using MongoDB.Bson.Serialization.Attributes;

namespace Sera.Entity.Cosmos
{
    [ExcludeFromCodeCoverage]
    public class EventHistory
    {
        [BsonId]
        public string _id { get; set; }
        public string transactionId { get; set; }
        public string method { get; set; }
        public string source { get; set; }
        public string payload { get; set; }
        public int status { get; set; }
        public string entity { get; set; }
        public int userId { get; set; }
        public DateTime date { get; set; }
        public string datePartition { get; set; }
    }
}
