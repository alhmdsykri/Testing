namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindContractsResponse
    {
        public int customerContractId { get; set; }
        public string contractNumber { get; set; }
        public string customerCode { get; set; }
        public string customerName { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public string contractStatus { get; set; }
        public DateTime? lastUpdate { get; set; }

    }
}