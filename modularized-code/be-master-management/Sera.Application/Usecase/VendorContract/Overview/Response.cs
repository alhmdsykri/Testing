namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewVendorContractResponse
    {
        public int totalVendor { get; set; }
        public int notStarted { get; set; }
        public int activeContract { get; set; }
        public int expiryContract { get; set; }
        public int expiredContract { get; set; }
       
    }
}