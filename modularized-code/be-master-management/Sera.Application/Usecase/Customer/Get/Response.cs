namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerResponse
    {
        public int CustomerId { get; set; }
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public int? IndustryId { get; set; }       
        public string? IndustryName { get; set; }       
        public string? CustomerAddress { get; set; }
        public string Status { get; set; }
    }
}