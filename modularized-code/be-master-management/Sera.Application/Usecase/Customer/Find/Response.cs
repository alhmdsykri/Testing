namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindCustomerResponse
    {
        public int customerId { get; set; }
        public string customerCode { get; set; }
        public string customerName { get; set; }
        public bool? isBlocked { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
    }
}