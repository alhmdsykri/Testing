namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindCustomerContractResponse
    {
        public int customerContractId { get; set; }
        public string contractNumber { get; set; }
        public string status { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}