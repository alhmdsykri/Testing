namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewContractResponse
    {
        public int totalVendor { get; set; }
        public int notStarted { get; set; }
        public int activeContract { get; set; }
        public int expiryContract { get; set; }       
    }
}