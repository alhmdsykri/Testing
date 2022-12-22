namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCompanyResponse
    {
        public string CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public ParentCompanyResponse ParentCompany { get; set; }
        public byte StructureLevel { get; set; }
        public bool SuspendFlag { get; set; }
        public bool SAPIntegrated { get; set; }
        public List<ChildCompanyResponse> ChildCompany { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class ParentCompanyResponse
    {
        public string CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public byte StructureLevel { get; set; }
        public bool SuspendFlag { get; set; }
        public bool SAPIntegrated { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class ChildCompanyResponse
    {
        public string CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public string ParentCompanyId { get; set; }
        public string ParentCompanyName { get; set; }
        public byte StructureLevel { get; set; }
        public bool SuspendFlag { get; set; }
        public bool SAPIntegrated { get; set; }
        public List<ChildCompanyResponse> ChildCompany { get; set; }
    }
}
