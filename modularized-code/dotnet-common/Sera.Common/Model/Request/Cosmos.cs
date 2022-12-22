namespace Sera.Common.Model.Request
{
    [ExcludeFromCodeCoverage]
    public class CosmosRequest
    {
        public string transactionId { get; set; }
        public string method { get; set; }
        public string source { get; set; }
        public string payload { get; set; }
        public int userId { get; set; }
        public int status { get; set; }
    }
}