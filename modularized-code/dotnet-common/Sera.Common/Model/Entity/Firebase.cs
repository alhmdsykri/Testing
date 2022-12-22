namespace Sera.Common.Model.Entity
{
    [ExcludeFromCodeCoverage]
    public class Notification
    {
        public string transactionId { get; set; }
        public string feURL { get; set; }
        public string payload { get; set; }
        public int status { get; set; }
        public string entity { get; set; }
        public DateTime createdAt { get; set; }
        public string message { get; set; }
    }
}
