namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateLocationVMRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public int userId { get; set; }      
        public string address { get; set; }      
        public int locationCode { get; set; }
        public int timeOffset { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}