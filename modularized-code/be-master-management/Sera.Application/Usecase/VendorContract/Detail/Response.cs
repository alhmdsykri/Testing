namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorContractDetailResponse
    {
        public int vendorContractId { get; set; }
        public string vendorName { get; set; }
        public string vendorContractNumber { get; set; }
        public string vendorContractType { get; set; }
        public int vendorContractStatus { get; set; }
        public string vendorContractPeriod { get; set; }
        public string companyName { get; set; }
        public string businessUnitName { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}