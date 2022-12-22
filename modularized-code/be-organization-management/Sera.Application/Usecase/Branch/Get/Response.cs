using System.Diagnostics.CodeAnalysis;

namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetBranchResponse
    {
        public int BranchId { get; set; }
        public string BranchCode { get; set; }
        public string BranchName { get; set; }
        public int BusinessUnitId { get; set; }
        public string BusinessUnitCode { get; set; }
        public string BusinessUnitName { get; set; }
        public int RegionId { get; set; }
        public string RegionName { get; set; }
        public bool SAPIntegrated { get; set; }
    }
}
