namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetContractResponse
    {
        public string contractNumber { get; set; }
        public string contractStatus { get; set; }
        public string customerCode { get; set; }
        public string customerName { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public bool? isB2B { get; set; } = false;
        public bool isMonthly { get; set; }
        public bool isProject { get; set; }
        public bool isTMS { get; set; }
        public DateTime? lastUpdate { get; set; }
    }
}