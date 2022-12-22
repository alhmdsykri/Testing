namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateBranchCQRSRequest
    {
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
    }
}
