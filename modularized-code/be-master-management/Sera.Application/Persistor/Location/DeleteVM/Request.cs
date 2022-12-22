namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteLocationVMRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public int userId { get; set; }
        public string action { get; set; }
        public string locationCode { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class DeleteLocationCQRSRequest
    {
        public int locationId { get; set; }
    }

}
