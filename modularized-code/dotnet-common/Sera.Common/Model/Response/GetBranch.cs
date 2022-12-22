namespace Sera.Common.Model.Response
{
    [ExcludeFromCodeCoverage]
    public class GetBranch
    {
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int regionId { get; set; }
        public string regionName { get; set; }
        public bool sapIntegrated { get; set; }
    }
}
