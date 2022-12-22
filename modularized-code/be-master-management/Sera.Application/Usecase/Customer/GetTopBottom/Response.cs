namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTopBottomCustomerResponse
    {
        public List<TopCustomer> topCustomer { get; set; }
        public List<BottomCustomer> bottomCustomer { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class TopCustomer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public decimal value { get; set; }
        public string customerLogo { get; set; }
        public string industry { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class BottomCustomer
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public decimal value { get; set; }
        public string customerLogo { get; set; }
        public string industry { get; set; }
    }
}
