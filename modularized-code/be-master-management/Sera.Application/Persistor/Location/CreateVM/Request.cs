namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateLocationVMRequest : IRequest<IResultStatus>
    {
        public string transactionId { get; set; }
        public int userId { get; set; }
        public string locationName { get; set; }
        public int locationTypeId { get; set; }
        public string address { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
        public int businessUnitId { get; set; }
        public int branchId { get; set; }
        public int locationCode { get; set; }
        public int timeOffset { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }   
}

