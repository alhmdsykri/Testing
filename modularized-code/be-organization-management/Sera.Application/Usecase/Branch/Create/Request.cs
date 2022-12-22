namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateBranchRequest : IRequest<Response>
    {
        public string? branchCode { get; set; }
        public string branchName { get; set; }
        public int businessUnitId { get; set; }
        public int regionId { get; set; }
        public bool sapIntegrated { get; set; }
    }
}
