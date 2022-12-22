namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetAllBranchResponse
    {
        public int BranchId { get; set; }
        public string BranchCode { get; set; }
        public string BranchName { get; set; }
        public int CompanyId { get; set; }
        public string CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public int BusinessUnitId { get; set; }
        public string BusinessUnitCode { get; set; }
        public string BusinessUnitName { get; set; }
        public int RegionId { get; set; }
        public string RegionName { get; set; }
        public bool SAPIntegrated { get; set; }
    }
}